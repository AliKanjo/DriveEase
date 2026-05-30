package com.driveease.backend.repositories;

import com.driveease.backend.models.SmsLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SmsLogRepository extends JpaRepository<SmsLog, Long> {
    List<SmsLog> findAllByOrderByCreatedAtDesc();
    List<SmsLog> findByUserIdOrderByCreatedAtDesc(Long userId);
    boolean existsByUserIdAndTypeAndMessageContaining(Long userId, String type, String messageContains);
}
