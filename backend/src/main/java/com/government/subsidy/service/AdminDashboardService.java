package com.government.subsidy.service;

import com.government.subsidy.model.Role;
import com.government.subsidy.repository.ApplicationRepository;
import com.government.subsidy.repository.AuditLogRepository;
import com.government.subsidy.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final AuditLogRepository auditLogRepository;

    public AdminDashboardService(UserRepository userRepository,
                                ApplicationRepository applicationRepository,
                                AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
        this.auditLogRepository = auditLogRepository;
    }

    public DashboardSummary getDashboardSummary() {
        long totalUsers = userRepository.count();
        long activeOfficers = userRepository.countByRoleIn(Set.of(
                Role.FIELD_OFFICER,
                Role.DISTRICT_OFFICER,
                Role.FINANCE_OFFICER,
                Role.ADMIN
        ));
        long totalApplications = applicationRepository.count();
        long totalAuditLogs = auditLogRepository.count();

        return new DashboardSummary(totalUsers, activeOfficers, totalApplications, totalAuditLogs);
    }

    public static class DashboardSummary {
        private final long totalUsers;
        private final long activeOfficers;
        private final long totalApplications;
        private final long totalAuditLogs;

        public DashboardSummary(long totalUsers, long activeOfficers, long totalApplications, long totalAuditLogs) {
            this.totalUsers = totalUsers;
            this.activeOfficers = activeOfficers;
            this.totalApplications = totalApplications;
            this.totalAuditLogs = totalAuditLogs;
        }

        public long getTotalUsers() { return totalUsers; }
        public long getActiveOfficers() { return activeOfficers; }
        public long getTotalApplications() { return totalApplications; }
        public long getTotalAuditLogs() { return totalAuditLogs; }
    }
}
