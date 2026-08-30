package com.government.subsidy.service;

import com.government.subsidy.dto.WorkflowActionRequest;
import com.government.subsidy.exception.ResourceNotFoundException;
import com.government.subsidy.model.*;
import com.government.subsidy.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final SchemeRepository schemeRepository;
    private final UserRepository userRepository;
    private final BeneficiaryProfileRepository profileRepository;
    private final WorkflowHistoryRepository workflowHistoryRepository;
    private final AuditLogService auditLogService;

    public ApplicationService(ApplicationRepository applicationRepository,
                              SchemeRepository schemeRepository,
                              UserRepository userRepository,
                              BeneficiaryProfileRepository profileRepository,
                              WorkflowHistoryRepository workflowHistoryRepository,
                              AuditLogService auditLogService) {
        this.applicationRepository = applicationRepository;
        this.schemeRepository = schemeRepository;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.workflowHistoryRepository = workflowHistoryRepository;
        this.auditLogService = auditLogService;
    }

    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    public Application getApplicationById(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id " + id));
    }

    public List<Application> getApplicationsForCitizen(String emailOrPhone) {
        return applicationRepository.findByCitizenEmailOrPhone(emailOrPhone);
    }

    public List<Application> getFieldOfficerQueue() {
        return applicationRepository.findByStatusIn(Arrays.asList(
                ApplicationStatus.SUBMITTED,
                ApplicationStatus.CORRECTION_REQUIRED
        ));
    }

    public List<Application> getDistrictOfficerQueue() {
        return applicationRepository.findByStatus(ApplicationStatus.FIELD_VERIFIED);
    }

    public List<Application> getFinanceOfficerQueue() {
        return applicationRepository.findByStatusIn(Arrays.asList(
                ApplicationStatus.DISTRICT_VERIFIED,
                ApplicationStatus.APPROVED_FOR_PAYMENT
        ));
    }

    @Transactional
    public Application submitApplication(Map<String, Object> payload, String authenticatedEmail) {
        Long schemeId = Long.parseLong(payload.getOrDefault("schemeId", "1").toString());
        Scheme scheme = schemeRepository.findById(schemeId)
                .orElseThrow(() -> new ResourceNotFoundException("Subsidy Scheme not found with id " + schemeId));

        if (!scheme.isActive()) {
            throw new IllegalArgumentException("The selected subsidy scheme is currently inactive or closed for applications.");
        }

        String userEmail = authenticatedEmail;
        if (userEmail == null && payload.containsKey("userEmail")) {
            userEmail = payload.get("userEmail").toString();
        }
        if (userEmail == null) {
            userEmail = "citizen@gov.in";
        }

        final String activeEmail = userEmail;

        List<ApplicationStatus> activeStatuses = Arrays.asList(
                ApplicationStatus.SUBMITTED,
                ApplicationStatus.FIELD_VERIFIED,
                ApplicationStatus.DISTRICT_VERIFIED,
                ApplicationStatus.APPROVED_FOR_PAYMENT,
                ApplicationStatus.PAYMENT_PENDING
        );
        if (applicationRepository.existsActiveApplicationForScheme(activeEmail, schemeId, Arrays.asList(ApplicationStatus.FIELD_REJECTED, ApplicationStatus.DISTRICT_REJECTED, ApplicationStatus.REJECTED))) {
            throw new IllegalArgumentException("You already have an active application for " + scheme.getName() + "!");
        }

        User citizenUser = userRepository.findByEmail(activeEmail)
                .orElseGet(() -> userRepository.findByPhone(activeEmail)
                .orElseGet(() -> userRepository.findAll().stream().filter(u -> u.getRole() == Role.CITIZEN).findFirst().orElse(null)));

        BeneficiaryProfile profile = null;
        if (citizenUser != null) {
            profile = profileRepository.findByUserId(citizenUser.getId()).orElse(null);
        }

        Application application = new Application();
        application.setScheme(scheme);
        application.setBeneficiary(profile);
        application.setSubmittedDate(LocalDateTime.now());

        int incomeScore = 30;
        int documentScore = 25;
        int categoryScore = 25;
        int districtScore = 20;

        if (payload.containsKey("income")) {
            double income = Double.parseDouble(payload.get("income").toString());
            if (income > 500000) incomeScore = 5;
            else if (income > 300000) incomeScore = 15;
            else if (income > 150000) incomeScore = 25;
        }

        if (payload.containsKey("aadhaarNumber") && payload.get("aadhaarNumber").toString().length() == 12) {
            documentScore = 25;
        }

        int totalScore = Math.min(100, incomeScore + documentScore + categoryScore + districtScore);
        application.setEligibilityScore(totalScore);

        if (totalScore >= 50) {
            application.setStatus(ApplicationStatus.SUBMITTED);
            application.setRemarks("Eligibility score: " + totalScore + "/100. Submitted for Level 1 Field Review.");
        } else {
            application.setStatus(ApplicationStatus.FIELD_REJECTED);
            application.setRemarks("Auto-flagged/Rejected: Eligibility score (" + totalScore + "/100) below minimum threshold of 50.");
        }

        Application saved = applicationRepository.save(application);

        if (auditLogService != null) {
            auditLogService.logAction("APPLICATION_SUBMITTED", activeEmail, "Submitted application #APP-" + saved.getId() + " for scheme: " + scheme.getName());
        }

        return saved;
    }

    @Transactional
    public Application processWorkflowAction(Long id, WorkflowActionRequest request, String officerEmail, Role officerRole) {
        Application application = getApplicationById(id);
        ApplicationStatus currentStatus = application.getStatus();

        String actionStr = request.getAction() != null ? request.getAction().toUpperCase() : "APPROVE";
        String comments = request.getComments();

        if (("REJECT".equals(actionStr) || "REQUEST_CORRECTION".equals(actionStr)) && (!StringUtils.hasText(comments))) {
            throw new IllegalArgumentException("Officer comments are compulsory when rejecting or requesting correction for an application.");
        }

        ApplicationStatus nextStatus = currentStatus;

        if (officerRole == Role.FIELD_OFFICER) {
            if (currentStatus != ApplicationStatus.SUBMITTED && currentStatus != ApplicationStatus.CORRECTION_REQUIRED) {
                throw new IllegalStateException("Field Officer can only process applications at Level 1 Review stage (Current status: " + currentStatus + ")");
            }
            if ("APPROVE".equals(actionStr)) {
                nextStatus = ApplicationStatus.FIELD_VERIFIED;
            } else if ("REJECT".equals(actionStr)) {
                nextStatus = ApplicationStatus.FIELD_REJECTED;
            } else if ("REQUEST_CORRECTION".equals(actionStr)) {
                nextStatus = ApplicationStatus.CORRECTION_REQUIRED;
            }
        } else if (officerRole == Role.DISTRICT_OFFICER) {
            if (currentStatus != ApplicationStatus.FIELD_VERIFIED) {
                throw new IllegalStateException("District Officer can only process applications approved by Field Officer (Current status: " + currentStatus + ")");
            }
            if ("APPROVE".equals(actionStr)) {
                nextStatus = ApplicationStatus.DISTRICT_VERIFIED;
            } else if ("REJECT".equals(actionStr)) {
                nextStatus = ApplicationStatus.DISTRICT_REJECTED;
            } else if ("REQUEST_CORRECTION".equals(actionStr)) {
                nextStatus = ApplicationStatus.CORRECTION_REQUIRED;
            }
        } else if (officerRole == Role.FINANCE_OFFICER) {
            if (currentStatus != ApplicationStatus.DISTRICT_VERIFIED) {
                throw new IllegalStateException("Finance Officer approval requires prior District Officer review (Current status: " + currentStatus + ")");
            }
            if ("APPROVE".equals(actionStr)) {
                nextStatus = ApplicationStatus.APPROVED_FOR_PAYMENT;
            } else if ("REJECT".equals(actionStr)) {
                nextStatus = ApplicationStatus.REJECTED;
            }
        } else if (officerRole == Role.ADMIN) {
            if (request.getTargetStatus() != null) {
                try {
                    nextStatus = ApplicationStatus.valueOf(request.getTargetStatus().toUpperCase());
                } catch (Exception ignored) {}
            }
        }

        application.setStatus(nextStatus);
        if (StringUtils.hasText(comments)) {
            application.setRemarks(comments);
        }

        Application updated = applicationRepository.save(application);

        WorkflowHistory history = new WorkflowHistory();
        history.setApplication(updated);
        history.setAction(actionStr + " (" + officerRole.name() + ")");
        history.setComments(comments != null ? comments : "Workflow status transition to " + nextStatus.name());
        history.setActionDate(LocalDateTime.now());
        workflowHistoryRepository.save(history);

        if (auditLogService != null) {
            auditLogService.logAction("WORKFLOW_TRANSITION", officerEmail, 
                    "Updated application #APP-" + id + " status from " + currentStatus + " to " + nextStatus + ". Action: " + actionStr);
        }

        return updated;
    }
}
