package com.government.subsidy.controller;

import com.government.subsidy.dto.LoginRequest;
import com.government.subsidy.dto.SignupRequest;
import com.government.subsidy.model.Beneficiary;
import com.government.subsidy.model.BeneficiaryProfile;
import com.government.subsidy.model.Officer;
import com.government.subsidy.model.Role;
import com.government.subsidy.model.User;
import com.government.subsidy.repository.BeneficiaryProfileRepository;
import com.government.subsidy.repository.UserRepository;
import com.government.subsidy.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping({ "/api/v1/auth", "/api/auth" })
public class AuthController {

        @Autowired
        AuthenticationManager authenticationManager;

        @Autowired
        UserRepository userRepository;

        @Autowired
        BeneficiaryProfileRepository profileRepository;

        @Autowired
        PasswordEncoder encoder;

        @Autowired
        JwtUtils jwtUtils;

        @PostMapping("/login")
        public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
                String identifier = loginRequest.getEmail() != null ? loginRequest.getEmail().trim() : "";
                String providedPassword = loginRequest.getPassword() != null ? loginRequest.getPassword() : "";

                User user = userRepository.findByEmailIgnoreCase(identifier)
                                .orElseGet(() -> userRepository.findByEmail(identifier)
                                                .orElseGet(() -> userRepository.findByPhone(identifier).orElse(null)));

                if (user == null) {
                        return ResponseEntity.badRequest().body(Map.of(
                                        "status", "error",
                                        "message", "Invalid credentials"));
                }

                Authentication authentication;
                try {
                        authentication = authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(user.getEmail(), providedPassword));
                } catch (BadCredentialsException ex) {
                        return ResponseEntity.badRequest().body(Map.of(
                                        "status", "error",
                                        "message", "Invalid User. Please check your credentials."));
                }

                SecurityContextHolder.getContext().setAuthentication(authentication);
                String jwt = jwtUtils.generateJwtToken(authentication);

                Map<String, Object> response = new HashMap<>();
                response.put("status", "success");
                response.put("message", "Login successful");
                response.put("token", jwt);
                response.put("email", user.getEmail());
                response.put("fullName", user.getFullName());
                response.put("role", user.getRole().name());
                response.put("id", user.getId());

                return ResponseEntity.ok(response);
        }

        @PostMapping({ "/signup", "/register" })
        public ResponseEntity<?> registerUser(@RequestBody SignupRequest signupRequest) {
                if (signupRequest.getEmail() != null && userRepository.existsByEmail(signupRequest.getEmail())) {
                        return ResponseEntity.badRequest()
                                        .body(Map.of("status", "error", "message",
                                                        "Error: Email is already registered!"));
                }
                if (signupRequest.getPhone() != null && userRepository.existsByPhone(signupRequest.getPhone())) {
                        return ResponseEntity.badRequest()
                                        .body(Map.of("status", "error", "message",
                                                        "Error: Mobile phone number is already registered!"));
                }

                Role userRole = Role.CITIZEN; // Force all public registrations to be CITIZEN/BENEFICIARY

                User savedUser;
                Beneficiary beneficiary = new Beneficiary();
                beneficiary.setEmail(signupRequest.getEmail());
                beneficiary.setPassword(encoder.encode(signupRequest.getPassword()));
                beneficiary.setFullName(signupRequest.getFullName());
                beneficiary.setPhone(signupRequest.getPhone());
                beneficiary.setRole(Role.CITIZEN);

                beneficiary.setAadhaarNumber(
                                signupRequest.getAadhaarNumber() != null ? signupRequest.getAadhaarNumber()
                                                : "000000000000");
                beneficiary.setCategory(signupRequest.getCategory() != null ? signupRequest.getCategory() : "GENERAL");
                beneficiary.setIncome(signupRequest.getIncome() != null ? signupRequest.getIncome() : 150000.0);
                beneficiary.setAddress(signupRequest.getAddress() != null ? signupRequest.getAddress() : "Address N/A");
                beneficiary.setBankAccountNumber(
                                signupRequest.getBankAccountNumber() != null ? signupRequest.getBankAccountNumber()
                                                : "999988887777");
                beneficiary.setIfscCode(
                                signupRequest.getIfscCode() != null ? signupRequest.getIfscCode() : "SBIN0001234");

                savedUser = userRepository.save(beneficiary);

                BeneficiaryProfile profile = new BeneficiaryProfile();
                profile.setUser(savedUser);
                profile.setAadhaarNumber(beneficiary.getAadhaarNumber());
                profile.setAddress(beneficiary.getAddress());
                profile.setBankAccountNumber(beneficiary.getBankAccountNumber());
                profile.setIfscCode(beneficiary.getIfscCode());
                profileRepository.save(profile);

                return ResponseEntity.ok(Map.of(
                                "status", "success",
                                "message", "User registered successfully in database!",
                                "userId", savedUser.getId()));
        }

        @PostMapping("/reset-password")
        public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
                String email = body.get("email");
                String newPassword = body.get("newPassword");

                if (email == null || email.isBlank() || newPassword == null || newPassword.isBlank()) {
                        return ResponseEntity.badRequest()
                                        .body(Map.of("status", "error", "message",
                                                        "Email and new password are required."));
                }

                User user = userRepository.findByEmailIgnoreCase(email.trim())
                                .orElseGet(() -> userRepository.findByEmail(email.trim())
                                                .orElseGet(() -> userRepository.findByPhone(email.trim())
                                                                .orElse(null)));

                if (user == null) {
                        return ResponseEntity.badRequest()
                                        .body(Map.of("status", "error", "message",
                                                        "No account found with this email or phone number."));
                }

                user.setPassword(encoder.encode(newPassword));
                userRepository.save(user);

                return ResponseEntity.ok(Map.of(
                                "status", "success",
                                "message", "Password updated successfully. Please login with your new password."));
        }
}