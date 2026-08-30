package com.government.subsidy.controller;

import com.government.subsidy.dto.WorkflowActionRequest;
import com.government.subsidy.model.Application;
import com.government.subsidy.model.ApplicationStatus;
import com.government.subsidy.model.Role;
import com.government.subsidy.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({ "/api/v1/applications", "/api/applications" })
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @GetMapping
    public List<Application> getAllApplications() {
        return applicationService.getAllApplications();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Application> getApplicationById(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getApplicationById(id));
    }

    @GetMapping("/my-applications")
    public ResponseEntity<List<Application>> getMyApplications() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser"))
                ? auth.getName()
                : "citizen@gov.in";
        return ResponseEntity.ok(applicationService.getApplicationsForCitizen(userEmail));
    }

    // Alias used by frontend service
    @GetMapping("/my")
    public ResponseEntity<List<Application>> getMyApplicationsAlias() {
        return getMyApplications();
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> getApplicationStatus(@PathVariable Long id) {
        Application app = applicationService.getApplicationById(id);
        Map<String, Object> statusMap = new HashMap<>();
        statusMap.put("id", app.getId());
        statusMap.put("status", app.getStatus());
        statusMap.put("eligibilityScore", app.getEligibilityScore());
        statusMap.put("submittedDate", app.getSubmittedDate());
        statusMap.put("remarks", app.getRemarks());
        return ResponseEntity.ok(statusMap);
    }

    @PostMapping
    public ResponseEntity<?> submitApplication(@RequestBody Map<String, Object> payload) {
        return doSubmit(payload);
    }

    // Alias used by frontend service
    @PostMapping("/submit")
    public ResponseEntity<?> submitApplicationAlias(@RequestBody Map<String, Object> payload) {
        return doSubmit(payload);
    }

    private ResponseEntity<?> doSubmit(Map<String, Object> payload) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser"))
                    ? auth.getName()
                    : null;

            Application application = applicationService.submitApplication(payload, userEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(application);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("status", "error", "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateApplicationStatus(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body) {

        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String officerEmail = (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser"))
                    ? auth.getName()
                    : "officer@gov.in";

            String actionStr = "APPROVE";
            String remarks = null;
            String targetStatus = null;

            if (body != null) {
                if (body.containsKey("status")) {
                    targetStatus = body.get("status").toString();
                    if (targetStatus.contains("REJECT"))
                        actionStr = "REJECT";
                    else if (targetStatus.contains("CORRECTION"))
                        actionStr = "REQUEST_CORRECTION";
                }
                if (body.containsKey("remarks")) {
                    remarks = body.get("remarks").toString();
                }
                if (body.containsKey("action")) {
                    actionStr = body.get("action").toString();
                }
            }

            WorkflowActionRequest req = new WorkflowActionRequest(actionStr, remarks, targetStatus);
            Application updated = applicationService.processWorkflowAction(id, req, officerEmail, Role.FIELD_OFFICER);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("status", "error", "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
}
