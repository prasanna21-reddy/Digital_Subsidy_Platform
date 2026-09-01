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
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final SchemeRepository schemeRepository;
    private final UserRepository userRepository;
    private final BeneficiaryProfileRepository profileRepository;
    private final WorkflowHistoryRepository workflowHistoryRepository;
    private final WorkflowStageRepository workflowStageRepository;
    private final AuditLogService auditLogService;

    public ApplicationService(ApplicationRepository applicationRepository,
            SchemeRepository schemeRepository,
            UserRepository userRepository,
            BeneficiaryProfileRepository profileRepository,
            WorkflowHistoryRepository workflowHistoryRepository,
            WorkflowStageRepository workflowStageRepository,
            AuditLogService auditLogService) {
        this.applicationRepository = applicationRepository;
        this.schemeRepository = schemeRepository;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.workflowHistoryRepository = workflowHistoryRepository;
        this.workflowStageRepository = workflowStageRepository;
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
        List<Application> queue = applicationRepository.findByStatusIn(Arrays.asList(
                ApplicationStatus.PENDING_FIELD_VERIFICATION,
                ApplicationStatus.CORRECTION_REQUIRED,
                ApplicationStatus.FIELD_VERIFIED,
                ApplicationStatus.FORWARDED_TO_DISTRICT,
                ApplicationStatus.DISTRICT_VERIFIED,
                ApplicationStatus.DISTRICT_REJECTED,
                ApplicationStatus.PAYMENT_ELIGIBLE,
                ApplicationStatus.APPROVED_FOR_PAYMENT,
                ApplicationStatus.PAYMENT_PENDING,
                ApplicationStatus.PAYMENT_SUCCESSFUL,
                ApplicationStatus.PAYMENT_FAILED));
        queue.sort(Comparator.comparing(Application::getEligibilityScore, Comparator.nullsLast(Integer::compareTo)).reversed());
        return queue;
    }

    public List<Application> getDistrictOfficerQueue() {
        List<Application> queue = applicationRepository.findByStatusIn(Arrays.asList(
                ApplicationStatus.FORWARDED_TO_DISTRICT,
                ApplicationStatus.DISTRICT_VERIFIED,
                ApplicationStatus.DISTRICT_REJECTED,
                ApplicationStatus.PAYMENT_ELIGIBLE,
                ApplicationStatus.APPROVED_FOR_PAYMENT,
                ApplicationStatus.PAYMENT_PENDING,
                ApplicationStatus.PAYMENT_SUCCESSFUL,
                ApplicationStatus.PAYMENT_FAILED));
        queue.sort(Comparator.comparing(Application::getEligibilityScore, Comparator.nullsLast(Integer::compareTo)).reversed());
        return queue;
    }

    public List<Application> getFinanceOfficerQueue() {
        List<Application> queue = applicationRepository.findByStatusIn(Arrays.asList(
                ApplicationStatus.PAYMENT_ELIGIBLE,
                ApplicationStatus.APPROVED_FOR_PAYMENT,
                ApplicationStatus.PAYMENT_PENDING,
                ApplicationStatus.PAYMENT_SUCCESSFUL));
        queue.sort(Comparator.comparing(Application::getEligibilityScore, Comparator.nullsLast(Integer::compareTo)).reversed());
        return queue;
    }

    public static int calculateInternalPriorityScore(Scheme scheme, Map<String, Object> payload, BeneficiaryProfile profile) {
        if (scheme == null || payload == null) {
            return 0;
        }

        String schemeText = (scheme.getName() + " " + scheme.getCategory() + " " + (scheme.getEligibilityCriteria() == null ? "" : scheme.getEligibilityCriteria()))
                .toLowerCase(Locale.ROOT);

        int total = 0;

        double income = extractDouble(payload.get("income"), profile != null ? profile.getAnnualIncome() : null);
        total += incomeScore(income);

        String category = normalizeText(payload.get("socialCategory"));
        if (category == null && profile != null) {
            category = normalizeText(profile.getSocialCategory());
        }
        if (category == null) {
            category = normalizeText(payload.get("category"));
        }
        total += categoryScore(category, schemeText);

        Integer age = extractInteger(payload.get("age"));
        if (age == null && profile != null && profile.getUser() != null) {
            age = extractInteger(payload.get("beneficiaryAge"));
        }
        total += ageScore(age, schemeText);

        total += schemeSpecificFitScore(schemeText, payload);
        total += documentsScore(payload, schemeText);

        return Math.max(0, Math.min(100, total));
    }

    private static double extractDouble(Object... values) {
        for (Object value : values) {
            if (value == null) continue;
            try {
                if (value instanceof Number number) {
                    return number.doubleValue();
                }
                return Double.parseDouble(value.toString().replaceAll("[₹,\s]", ""));
            } catch (Exception ignored) {
            }
        }
        return 0.0;
    }

    private static Integer extractInteger(Object... values) {
        for (Object value : values) {
            if (value == null) continue;
            try {
                if (value instanceof Number number) {
                    return number.intValue();
                }
                return Integer.parseInt(value.toString().replaceAll("[^0-9-]", ""));
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    private static String normalizeText(Object value) {
        if (value == null) return null;
        String text = value.toString().trim();
        return text.isEmpty() ? null : text.toUpperCase(Locale.ROOT);
    }

    private static int incomeScore(double income) {
        if (income <= 0) return 0;
        if (income <= 50000) return 30;
        if (income <= 100000) return 25;
        if (income <= 150000) return 20;
        if (income <= 250000) return 12;
        if (income <= 400000) return 6;
        return 2;
    }

    private static int categoryScore(String category, String schemeText) {
        if (category == null) return 8;

        boolean isReservedCategory = category.matches("(SC|ST|OBC|EWS|WOMEN|PWD|MINORITY|SENIOR|DISABLED)");
        if (isReservedCategory) {
            return schemeText.contains("scholarship") || schemeText.contains("education") ? 18 : 15;
        }

        if ("GENERAL".equals(category)) {
            return schemeText.contains("farmer") || schemeText.contains("agriculture") ? 10 : 12;
        }

        return 10;
    }

    private static int ageScore(Integer age, String schemeText) {
        if (age == null) return 8;
        if (schemeText.contains("student") || schemeText.contains("education") || schemeText.contains("scholarship")) {
            return (age >= 18 && age <= 30) ? 15 : 8;
        }
        if (schemeText.contains("farmer") || schemeText.contains("agriculture") || schemeText.contains("housing") || schemeText.contains("business") || schemeText.contains("msme") || schemeText.contains("welfare")) {
            return (age >= 18 && age <= 70) ? 15 : 8;
        }
        return (age >= 18 && age <= 65) ? 12 : 8;
    }

    private static int schemeSpecificFitScore(String schemeText, Map<String, Object> payload) {
        Map<String, Object> specificDetails = new HashMap<>();
        Object details = payload.get("specificDetails");
        if (details instanceof Map<?, ?> map) {
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                specificDetails.put(String.valueOf(entry.getKey()), entry.getValue());
            }
        }

        if (schemeText.contains("farmer") || schemeText.contains("agriculture") || schemeText.contains("kisan") || schemeText.contains("land")) {
            Object landHolding = payload.get("landHolding") != null ? payload.get("landHolding") : specificDetails.get("landHolding");
            if (landHolding != null) {
                try {
                    String landText = landHolding.toString().replaceAll("[A-Za-z\s]", "");
                    double landValue = Double.parseDouble(landText);
                    return landValue <= 2 ? 25 : (landValue <= 5 ? 18 : 10);
                } catch (Exception ignored) {
                    return 18;
                }
            }
            return 10;
        }

        if (schemeText.contains("student") || schemeText.contains("education") || schemeText.contains("scholarship")) {
            boolean detailsPresent = hasAny(payload, specificDetails, "institutionName", "courseName", "studentId", "yearOfStudy");
            return detailsPresent ? 25 : 8;
        }

        if (schemeText.contains("business") || schemeText.contains("msme") || schemeText.contains("enterprise")) {
            boolean detailsPresent = hasAny(payload, specificDetails, "businessName", "businessType", "registrationNumber", "investmentRequired");
            return detailsPresent ? 25 : 8;
        }

        if (schemeText.contains("housing") || schemeText.contains("shelter") || schemeText.contains("home")) {
            boolean detailsPresent = hasAny(payload, specificDetails, "houseType", "landOwnership", "estimatedCost", "plotNumber");
            return detailsPresent ? 20 : 8;
        }

        if (schemeText.contains("welfare") || schemeText.contains("pension") || schemeText.contains("disability")) {
            boolean detailsPresent = hasAny(payload, specificDetails, "disabilityType", "dependents", "pensionAccount");
            return detailsPresent ? 20 : 8;
        }

        boolean generalDetailsPresent = hasAny(payload, specificDetails, "purposeOfGrant", "estimatedAmount");
        return generalDetailsPresent ? 15 : 8;
    }

    private static boolean hasAny(Map<String, Object> payload, Map<String, Object> specificDetails, String... keys) {
        for (String key : keys) {
            if (payload.containsKey(key) && payload.get(key) != null && !payload.get(key).toString().trim().isEmpty()) {
                return true;
            }
            if (specificDetails.containsKey(key) && specificDetails.get(key) != null && !specificDetails.get(key).toString().trim().isEmpty()) {
                return true;
            }
        }
        return false;
    }

    private static int documentsScore(Map<String, Object> payload, String schemeText) {
        String documentText = firstNonBlank(payload.get("documentType"), payload.get("documents"), payload.get("requiredDocuments"));
        if (documentText == null) {
            return 0;
        }

        List<String> docs = Arrays.stream(documentText.split("[|,/;]"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());

        if (docs.size() >= 4) return 10;
        if (docs.size() >= 3) return 8;
        if (docs.size() >= 2) return 5;
        if (docs.size() >= 1) return 2;
        return 0;
    }

    private static String firstNonBlank(Object... values) {
        for (Object value : values) {
            if (value != null) {
                String text = value.toString().trim();
                if (!text.isEmpty()) {
                    return text;
                }
            }
        }
        return null;
    }

    @Transactional
    public Application submitApplication(Map<String, Object> payload, String authenticatedEmail) {
        Long schemeId = Long.parseLong(payload.getOrDefault("schemeId", "1").toString());
        Scheme scheme = schemeRepository.findById(schemeId)
                .orElseThrow(() -> new ResourceNotFoundException("Subsidy Scheme not found with id " + schemeId));

        if (!scheme.isActive()) {
            throw new IllegalArgumentException(
                    "The selected subsidy scheme is currently inactive or closed for applications.");
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
                ApplicationStatus.PENDING_FIELD_VERIFICATION,
                ApplicationStatus.FIELD_VERIFIED,
                ApplicationStatus.FORWARDED_TO_DISTRICT,
                ApplicationStatus.DISTRICT_VERIFIED,
                ApplicationStatus.PAYMENT_ELIGIBLE,
                ApplicationStatus.APPROVED_FOR_PAYMENT,
                ApplicationStatus.PAYMENT_PENDING);
        if (applicationRepository.existsActiveApplicationForScheme(activeEmail, schemeId, Arrays.asList(
                ApplicationStatus.FIELD_REJECTED, ApplicationStatus.DISTRICT_REJECTED, ApplicationStatus.REJECTED))) {
            throw new IllegalArgumentException("You already have an active application for " + scheme.getName() + "!");
        }

        User citizenUser = userRepository.findByEmail(activeEmail)
                .orElseGet(() -> userRepository.findByPhone(activeEmail)
                        .orElseGet(() -> userRepository.findAll().stream().filter(u -> u.getRole() == Role.CITIZEN)
                                .findFirst().orElse(null)));

        BeneficiaryProfile profile = null;
        if (citizenUser != null) {
            profile = profileRepository.findByUserId(citizenUser.getId()).orElse(null);
        }

        Application application = new Application();
        application.setScheme(scheme);
        application.setBeneficiary(profile);
        application.setSubmittedDate(LocalDateTime.now());

        int totalScore = calculateInternalPriorityScore(scheme, payload, profile);
        application.setEligibilityScore(totalScore);

        if (totalScore >= 50) {
            application.setStatus(ApplicationStatus.PENDING_FIELD_VERIFICATION);
            application.setRemarks("Internal priority score: " + totalScore + "/100. Submitted for Level 1 Field Review.");
        } else {
            application.setStatus(ApplicationStatus.FIELD_REJECTED);
            application.setRemarks(
                    "Auto-flagged/Rejected: Internal priority score (" + totalScore + "/100) below minimum threshold of 50.");
        }

        Application saved = applicationRepository.save(application);

        if (auditLogService != null) {
            auditLogService.logAction("APPLICATION_SUBMITTED", activeEmail,
                    "Submitted application #APP-" + saved.getId() + " for scheme: " + scheme.getName());
        }

        return saved;
    }

    @Transactional
    public Application processWorkflowAction(Long id, WorkflowActionRequest request, String officerEmail,
            Role officerRole) {
        Application application = getApplicationById(id);
        ApplicationStatus currentStatus = application.getStatus();

        String actionStr = request.getAction() != null ? request.getAction().toUpperCase() : "APPROVE";
        String comments = request.getComments();

        if (("REJECT".equals(actionStr) || "REQUEST_CORRECTION".equals(actionStr))
                && (!StringUtils.hasText(comments))) {
            throw new IllegalArgumentException(
                    "Officer comments are compulsory when rejecting or requesting correction for an application.");
        }

        ApplicationStatus nextStatus = currentStatus;

        if (officerRole == Role.FIELD_OFFICER) {
            if (currentStatus != ApplicationStatus.PENDING_FIELD_VERIFICATION
                    && currentStatus != ApplicationStatus.CORRECTION_REQUIRED
                    && currentStatus != ApplicationStatus.FIELD_VERIFIED) {
                throw new IllegalStateException(
                        "Field Officer can only process applications at Level 1 Review stage (Current status: "
                                + currentStatus + ")");
            }
            if ("FORWARD".equals(actionStr)) {
                if (currentStatus != ApplicationStatus.FIELD_VERIFIED) {
                    throw new IllegalStateException("Can only forward verified applications.");
                }
                nextStatus = ApplicationStatus.FORWARDED_TO_DISTRICT;
            } else if ("APPROVE".equals(actionStr) || "VERIFY".equals(actionStr)) {
                nextStatus = ApplicationStatus.FIELD_VERIFIED;
            } else if ("REJECT".equals(actionStr)) {
                nextStatus = ApplicationStatus.FIELD_REJECTED;
            } else if ("REQUEST_CORRECTION".equals(actionStr)) {
                nextStatus = ApplicationStatus.CORRECTION_REQUIRED;
            }
        } else if (officerRole == Role.DISTRICT_OFFICER) {
            if (currentStatus != ApplicationStatus.FORWARDED_TO_DISTRICT) {
                throw new IllegalStateException(
                        "District Officer can only process forwarded applications (Current status: " + currentStatus
                                + ")");
            }
            if ("APPROVE".equals(actionStr)) {
                nextStatus = ApplicationStatus.PAYMENT_ELIGIBLE;
            } else if ("REJECT".equals(actionStr)) {
                nextStatus = ApplicationStatus.DISTRICT_REJECTED;
            } else if ("REQUEST_CORRECTION".equals(actionStr)) {
                nextStatus = ApplicationStatus.CORRECTION_REQUIRED;
            }
        } else if (officerRole == Role.FINANCE_OFFICER) {
            if (currentStatus != ApplicationStatus.PAYMENT_ELIGIBLE
                    && currentStatus != ApplicationStatus.APPROVED_FOR_PAYMENT) {
                throw new IllegalStateException(
                        "Finance Officer approval requires an eligible application (Current status: "
                                + currentStatus + ")");
            }
            if ("RELEASE".equals(actionStr) || "APPROVE".equals(actionStr)) {
                nextStatus = ApplicationStatus.PAYMENT_SUCCESSFUL;
            } else if ("REJECT".equals(actionStr)) {
                nextStatus = ApplicationStatus.REJECTED;
            }
        } else if (officerRole == Role.ADMIN) {
            if (request.getTargetStatus() != null) {
                try {
                    nextStatus = ApplicationStatus.valueOf(request.getTargetStatus().toUpperCase());
                } catch (Exception ignored) {
                }
            }
        }

        application.setStatus(nextStatus);
        if (StringUtils.hasText(comments)) {
            application.setRemarks(comments);
        }

        Application updated = applicationRepository.save(application);

        if (auditLogService != null) {
            try {
                auditLogService.logAction("WORKFLOW_TRANSITION", officerEmail,
                        "Updated application #APP-" + id + " status from " + currentStatus + " to " + nextStatus
                                + ". Action: " + actionStr + (StringUtils.hasText(comments) ? " | Comments: " + comments : ""));
            } catch (Exception logEx) {
                System.out.println("[WARN] Audit log failed (non-critical): " + logEx.getMessage());
            }
        }

        return updated;
    }

    @org.springframework.transaction.annotation.Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void saveWorkflowHistory(Application application, String action, Role role, String comments) {
        WorkflowHistory history = new WorkflowHistory();
        history.setApplication(application);
        history.setAction(action + " (" + role.name() + ")");
        history.setComments(comments);
        history.setActionDate(LocalDateTime.now());
        if (workflowStageRepository != null) {
            workflowStageRepository.findAll().stream().findFirst().ifPresent(history::setStage);
        }
        workflowHistoryRepository.save(history);
    }
}
