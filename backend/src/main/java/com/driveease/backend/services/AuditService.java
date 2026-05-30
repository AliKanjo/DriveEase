package com.driveease.backend.services;

import com.driveease.backend.models.AuditLog;
import com.driveease.backend.repositories.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Async
    public void logAction(String username, String action, String entityName, String entityId) {
        AuditLog log = AuditLog.builder()
                .username(username != null ? username : "SYSTEM")
                .action(action)
                .entityName(entityName)
                .entityId(entityId)
                .build();
        auditLogRepository.save(log);
    }
}
