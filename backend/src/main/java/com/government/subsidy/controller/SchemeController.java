package com.government.subsidy.controller;

import com.government.subsidy.model.Scheme;
import com.government.subsidy.service.SchemeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/schemes", "/api/schemes"})
public class SchemeController {

    @Autowired
    private SchemeService schemeService;

    @GetMapping
    public List<Scheme> getAllSchemes() {
        List<Scheme> schemes = schemeService.getAllSchemes();
        if (schemes.isEmpty()) {
            schemeService.createScheme(new Scheme(null, "Pradhan Mantri Awas Yojana", "Housing subsidy scheme for low & middle income families", "Income below ₹3,00,000 / General, SC, ST", 250000.0, true));
            schemeService.createScheme(new Scheme(null, "PM-KISAN Samman Nidhi", "Direct income support of ₹6,000 per year for small farmers", "Small & Marginal Farmers", 6000.0, true));
            schemeService.createScheme(new Scheme(null, "National Higher Education Scholarship", "Financial aid for undergraduate & postgraduate students", "Students with family income < ₹2,50,000", 50000.0, true));
            schemes = schemeService.getAllSchemes();
        }
        return schemes;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Scheme> getSchemeById(@PathVariable Long id) {
        Scheme scheme = schemeService.getSchemeById(id);
        if (scheme != null) {
            return ResponseEntity.ok(scheme);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public Scheme createScheme(@RequestBody Scheme scheme) {
        return schemeService.createScheme(scheme);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Scheme> updateScheme(@PathVariable Long id, @RequestBody Scheme schemeDetails) {
        try {
            return ResponseEntity.ok(schemeService.updateScheme(id, schemeDetails));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<Scheme> activateScheme(@PathVariable Long id) {
        return ResponseEntity.ok(schemeService.activateScheme(id));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Scheme> deactivateScheme(@PathVariable Long id) {
        return ResponseEntity.ok(schemeService.deactivateScheme(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteScheme(@PathVariable Long id) {
        schemeService.deleteScheme(id);
        return ResponseEntity.ok().build();
    }
}
