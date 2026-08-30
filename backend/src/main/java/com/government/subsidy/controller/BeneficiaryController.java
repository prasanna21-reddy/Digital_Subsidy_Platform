package com.government.subsidy.controller;

import com.government.subsidy.model.BeneficiaryProfile;
import com.government.subsidy.service.BeneficiaryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/beneficiaries", "/api/beneficiaries"})
public class BeneficiaryController {

    private final BeneficiaryService beneficiaryService;

    public BeneficiaryController(BeneficiaryService beneficiaryService) {
        this.beneficiaryService = beneficiaryService;
    }

    @GetMapping
    public ResponseEntity<List<BeneficiaryProfile>> getAllProfiles() {
        return ResponseEntity.ok(beneficiaryService.getAllProfiles());
    }

    @PostMapping("/{userId}")
    public ResponseEntity<?> createProfile(@PathVariable @NonNull Long userId, @Valid @RequestBody BeneficiaryProfile profile) {
        return ResponseEntity.ok(beneficiaryService.createProfile(userId, profile));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<BeneficiaryProfile> getProfile(@PathVariable @NonNull Long userId) {
        return ResponseEntity.ok(beneficiaryService.getProfile(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BeneficiaryProfile> updateProfile(@PathVariable @NonNull Long id, @RequestBody BeneficiaryProfile profile) {
        return ResponseEntity.ok(beneficiaryService.updateProfile(id, profile));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProfile(@PathVariable @NonNull Long id) {
        beneficiaryService.deleteProfile(id);
        return ResponseEntity.ok().build();
    }
}
