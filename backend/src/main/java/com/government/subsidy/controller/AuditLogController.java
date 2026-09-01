package com.government.subsidy.controller;

import com.government.subsidy.model.AuditLog;
import com.government.subsidy.service.AuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({ "/api/v1/audit", "/api/audit" })
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping("/logs")
    public ResponseEntity<List<AuditLog>> getAllLogs() {
        return ResponseEntity.ok(auditLogService.getAllLogs());
    }
}
