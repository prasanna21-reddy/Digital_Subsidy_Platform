package com.government.subsidy.service;

import com.government.subsidy.model.Scheme;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class ApplicationServiceScoringTest {

    @Test
    void calculateInternalPriorityScore_shouldRewardIncomeCategoryAgeAndSchemeFit() {
        Scheme scheme = new Scheme();
        scheme.setName("PM-KISAN Samman Nidhi");
        scheme.setCategory("Agriculture");
        scheme.setEligibilityCriteria("Landholding up to 2 hectares and income below ₹1,50,000");

        Map<String, Object> payload = new HashMap<>();
        payload.put("income", 42000.0);
        payload.put("socialCategory", "SC");
        payload.put("age", 29);
        payload.put("landHolding", "1.5 acres");
        payload.put("documentType", "Land Pattadar Passbook | Aadhaar Card | Bank Passbook");

        int score = ApplicationService.calculateInternalPriorityScore(scheme, payload, null);

        assertTrue(score >= 80, "Expected a high score for a strong farmer application: " + score);
        assertTrue(score <= 100, "Score should stay in the 0-100 range: " + score);
    }

    @Test
    void calculateInternalPriorityScore_shouldReduceScoreForWeakFitOrMissingDocuments() {
        Scheme scheme = new Scheme();
        scheme.setName("Education Scholarship");
        scheme.setCategory("Education");
        scheme.setEligibilityCriteria("Annual income below ₹2,50,000 and valid college enrollment");

        Map<String, Object> payload = new HashMap<>();
        payload.put("income", 300000.0);
        payload.put("socialCategory", "GENERAL");
        payload.put("age", 19);
        payload.put("documentType", "Aadhaar Card");
        payload.put("specificDetails", Map.of("courseName", "B.Tech"));

        int score = ApplicationService.calculateInternalPriorityScore(scheme, payload, null);

        assertTrue(score < 70, "Weak fit and missing documents should lower the priority score: " + score);
    }
}
