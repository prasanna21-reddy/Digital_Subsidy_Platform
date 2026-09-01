package com.government.subsidy.controller;

import com.government.subsidy.service.AdminDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping({ "/api/v1/admin", "/api/admin" })
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    public AdminDashboardController(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Long>> getSummary() {
        AdminDashboardService.DashboardSummary summary = adminDashboardService.getDashboardSummary();
        return ResponseEntity.ok(Map.of(
                "totalUsers", summary.getTotalUsers(),
                "activeOfficers", summary.getActiveOfficers(),
                "totalApplications", summary.getTotalApplications(),
                "totalAuditLogs", summary.getTotalAuditLogs()
        ));
    }
}
