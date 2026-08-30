package com.government.subsidy.controller;

import com.government.subsidy.model.Application;
import com.government.subsidy.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.government.subsidy.model.Role;
import com.government.subsidy.dto.WorkflowActionRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({ "/api/v1/workflow", "/api/workflow" })
public class WorkflowController {

    @Autowired
    private ApplicationService applicationService;

    @GetMapping("/field/queue")
    public ResponseEntity<List<Application>> getFieldQueue() {
        return ResponseEntity.ok(applicationService.getFieldOfficerQueue());
    }

    @GetMapping("/district/queue")
    public ResponseEntity<List<Application>> getDistrictQueue() {
        return ResponseEntity.ok(applicationService.getDistrictOfficerQueue());
    }

    @GetMapping("/finance/queue")
    public ResponseEntity<List<Application>> getFinanceQueue() {
        return ResponseEntity.ok(applicationService.getFinanceOfficerQueue());
    }

    @PostMapping("/field/action")
    public ResponseEntity<?> fieldAction(@RequestBody Map<String, Object> body) {
        return handleAction(body, Role.FIELD_OFFICER);
    }

    @PostMapping("/district/action")
    public ResponseEntity<?> districtAction(@RequestBody Map<String, Object> body) {
        return handleAction(body, Role.DISTRICT_OFFICER);
    }

    @PostMapping("/finance/action")
    public ResponseEntity<?> financeAction(@RequestBody Map<String, Object> body) {
        return handleAction(body, Role.FINANCE_OFFICER);
    }

    private ResponseEntity<?> handleAction(Map<String, Object> body, Role role) {
        try {
            Long id = Long.parseLong(body.get("applicationId").toString());
            String action = body.containsKey("action") ? body.get("action").toString() : "APPROVE";
            String comments = body.containsKey("comments") ? body.get("comments").toString() : null;

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String officerEmail = (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser"))
                    ? auth.getName()
                    : role.name() + "@gov.in";

            WorkflowActionRequest req = new WorkflowActionRequest(action, comments, null);
            Application updated = applicationService.processWorkflowAction(id, req, officerEmail, role);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
}
