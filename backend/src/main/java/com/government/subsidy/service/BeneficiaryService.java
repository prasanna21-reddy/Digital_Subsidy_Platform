package com.government.subsidy.service;

import com.government.subsidy.dto.ProfileDTO;
import com.government.subsidy.exception.ResourceNotFoundException;
import com.government.subsidy.model.BeneficiaryProfile;
import com.government.subsidy.model.User;
import com.government.subsidy.repository.BeneficiaryProfileRepository;
import com.government.subsidy.repository.UserRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BeneficiaryService {
    private final BeneficiaryProfileRepository profileRepository;
    private final UserRepository userRepository;

    public BeneficiaryService(BeneficiaryProfileRepository profileRepository, UserRepository userRepository) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    public List<BeneficiaryProfile> getAllProfiles() {
        return profileRepository.findAll();
    }

    @Transactional
    public BeneficiaryProfile createProfile(@NonNull Long userId, BeneficiaryProfile profile) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + userId));
        profile.setUser(user);
        return profileRepository.save(profile);
    }

    public BeneficiaryProfile getProfile(@NonNull Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + userId));

        return profileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary profile not found for user " + userId));
    }

    @Transactional
    public BeneficiaryProfile updateProfile(@NonNull Long id, BeneficiaryProfile details) {
        BeneficiaryProfile profile = profileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary profile not found with id " + id));

        if (details.getAadhaarNumber() != null)
            profile.setAadhaarNumber(details.getAadhaarNumber());
        if (details.getAddress() != null)
            profile.setAddress(details.getAddress());
        if (details.getBankAccountNumber() != null)
            profile.setBankAccountNumber(details.getBankAccountNumber());
        if (details.getIfscCode() != null)
            profile.setIfscCode(details.getIfscCode());

        return profileRepository.save(profile);
    }

    @Transactional
    public void deleteProfile(@NonNull Long id) {
        if (!profileRepository.existsById(id)) {
            throw new ResourceNotFoundException("Beneficiary profile not found with id " + id);
        }
        profileRepository.deleteById(id);
    }

    public ProfileDTO getMyProfileDTO(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        BeneficiaryProfile profile = profileRepository.findByUser(user).orElse(null);

        ProfileDTO dto = new ProfileDTO();
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());

        if (profile != null) {
            dto.setAadhaarNumber(profile.getAadhaarNumber());
            dto.setAddress(profile.getAddress());
            dto.setBankAccountNumber(profile.getBankAccountNumber());
            dto.setIfscCode(profile.getIfscCode());
            dto.setAnnualIncome(profile.getAnnualIncome());
            dto.setSocialCategory(profile.getSocialCategory());
        }
        return dto;
    }

    @Transactional
    public ProfileDTO updateMyProfileDTO(String email, ProfileDTO details) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (details.getEmail() != null && !details.getEmail().equals(user.getEmail())) {
            user.setEmail(details.getEmail());
        }
        if (details.getPhone() != null) {
            user.setPhone(details.getPhone());
        }
        userRepository.save(user);

        BeneficiaryProfile profile = profileRepository.findByUser(user).orElse(new BeneficiaryProfile());
        if (profile.getUser() == null) {
            profile.setUser(user);
        }

        if (details.getAadhaarNumber() != null)
            profile.setAadhaarNumber(details.getAadhaarNumber());
        if (details.getAddress() != null)
            profile.setAddress(details.getAddress());
        if (details.getBankAccountNumber() != null)
            profile.setBankAccountNumber(details.getBankAccountNumber());
        if (details.getIfscCode() != null)
            profile.setIfscCode(details.getIfscCode());
        if (details.getAnnualIncome() != null)
            profile.setAnnualIncome(details.getAnnualIncome());
        if (details.getSocialCategory() != null)
            profile.setSocialCategory(details.getSocialCategory());

        profileRepository.save(profile);
        return getMyProfileDTO(user.getEmail());
    }
}
