package com.government.subsidy.service;

import com.government.subsidy.exception.ResourceNotFoundException;
import com.government.subsidy.model.Scheme;
import com.government.subsidy.repository.SchemeRepository;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SchemeService {
    private final SchemeRepository schemeRepository;

    public SchemeService(SchemeRepository schemeRepository) {
        this.schemeRepository = schemeRepository;
    }

    public List<Scheme> getAllSchemes() {
        return schemeRepository.findAll();
    }

    public Scheme getSchemeById(@NonNull Long id) {
        return schemeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Scheme not found with id " + id));
    }

    @Transactional
    public Scheme createScheme(@NonNull Scheme scheme) {
        return schemeRepository.save(scheme);
    }

    @Transactional
    public Scheme updateScheme(@NonNull Long id, Scheme schemeDetails) {
        Scheme existingScheme = getSchemeById(id);
        existingScheme.setName(schemeDetails.getName());
        existingScheme.setDescription(schemeDetails.getDescription());
        existingScheme.setEligibilityCriteria(schemeDetails.getEligibilityCriteria());
        existingScheme.setBudget(schemeDetails.getBudget());
        existingScheme.setActive(schemeDetails.isActive());
        return schemeRepository.save(existingScheme);
    }

    public List<Scheme> getActiveSchemes() {
        return schemeRepository.findByActiveTrue();
    }

    @Transactional
    public Scheme activateScheme(@NonNull Long id) {
        Scheme scheme = getSchemeById(id);
        scheme.setActive(true);
        return schemeRepository.save(scheme);
    }

    @Transactional
    public Scheme deactivateScheme(@NonNull Long id) {
        Scheme scheme = getSchemeById(id);
        scheme.setActive(false);
        return schemeRepository.save(scheme);
    }

    @Transactional
    public void deleteScheme(Long id) {
        Scheme scheme = getSchemeById(id);
        schemeRepository.delete(scheme);
    }
}
