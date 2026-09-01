package com.government.subsidy.service;

import com.government.subsidy.model.Role;
import com.government.subsidy.repository.ApplicationRepository;
import com.government.subsidy.repository.AuditLogRepository;
import com.government.subsidy.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminDashboardServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AdminDashboardService adminDashboardService;

    @Test
    void shouldReturnDashboardCountsFromDatabase() {
        when(userRepository.count()).thenReturn(42L);
        when(userRepository.countByRoleIn(anyCollection())).thenReturn(7L);
        when(applicationRepository.count()).thenReturn(18L);
        when(auditLogRepository.count()).thenReturn(9L);

        AdminDashboardService.DashboardSummary summary = adminDashboardService.getDashboardSummary();

        assertEquals(42, summary.getTotalUsers());
        assertEquals(7, summary.getActiveOfficers());
        assertEquals(18, summary.getTotalApplications());
        assertEquals(9, summary.getTotalAuditLogs());
    }
}
