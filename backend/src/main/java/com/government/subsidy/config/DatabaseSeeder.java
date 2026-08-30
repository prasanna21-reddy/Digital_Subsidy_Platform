package com.government.subsidy.config;

import com.government.subsidy.model.Officer;
import com.government.subsidy.model.Role;
import com.government.subsidy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Create Admin if not exists
        if (userRepository.findByEmail("admin@gov.in").isEmpty()) {
            Officer admin = new Officer();
            admin.setEmail("admin@gov.in");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setFullName("System Administrator");
            admin.setPhone("9988776655");
            admin.setRole(Role.ADMIN);
            admin.setDesignation("Super Admin");
            admin.setDepartment("IT & e-Governance");
            admin.setDistrict("State HQ");
            userRepository.save(admin);
            System.out.println("Default Admin seeded: admin@gov.in / Admin@123");
        }

        // Create Default Field Officer if not exists
        if (userRepository.findByEmail("field.officer@gov.in").isEmpty()) {
            Officer fieldOfficer = new Officer();
            fieldOfficer.setEmail("field.officer@gov.in");
            fieldOfficer.setPassword(passwordEncoder.encode("Officer@123"));
            fieldOfficer.setFullName("Anil Kumar");
            fieldOfficer.setPhone("8877665544");
            fieldOfficer.setRole(Role.FIELD_OFFICER);
            fieldOfficer.setDesignation("Field Inspection Officer Level 1");
            fieldOfficer.setDepartment("Revenue Verification");
            fieldOfficer.setDistrict("District Central");
            userRepository.save(fieldOfficer);
            System.out.println("Default Field Officer seeded: field.officer@gov.in / Officer@123");
        }

        // Create Default District Officer if not exists
        if (userRepository.findByEmail("district.officer@gov.in").isEmpty()) {
            Officer districtOfficer = new Officer();
            districtOfficer.setEmail("district.officer@gov.in");
            districtOfficer.setPassword(passwordEncoder.encode("Officer@123"));
            districtOfficer.setFullName("Suresh Verma");
            districtOfficer.setPhone("7766554433");
            districtOfficer.setRole(Role.DISTRICT_OFFICER);
            districtOfficer.setDesignation("District Magistrate Reviewer Level 2");
            districtOfficer.setDepartment("District Collectorate");
            districtOfficer.setDistrict("District Central");
            userRepository.save(districtOfficer);
            System.out.println("Default District Officer seeded: district.officer@gov.in / Officer@123");
        }

        // Create Default Finance Officer if not exists
        if (userRepository.findByEmail("finance.officer@gov.in").isEmpty()) {
            Officer financeOfficer = new Officer();
            financeOfficer.setEmail("finance.officer@gov.in");
            financeOfficer.setPassword(passwordEncoder.encode("Officer@123"));
            financeOfficer.setFullName("Priya Patel");
            financeOfficer.setPhone("6655443322");
            financeOfficer.setRole(Role.FINANCE_OFFICER);
            financeOfficer.setDesignation("Treasury & Disbursement Officer Level 3");
            financeOfficer.setDepartment("State Finance Department");
            financeOfficer.setDistrict("District Central");
            userRepository.save(financeOfficer);
            System.out.println("Default Finance Officer seeded: finance.officer@gov.in / Officer@123");
        }
    }
}
