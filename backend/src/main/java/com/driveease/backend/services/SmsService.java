package com.driveease.backend.services;

import com.driveease.backend.models.SmsLog;
import com.driveease.backend.models.User;
import com.driveease.backend.repositories.SmsLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SmsService {

    private static final Logger logger = LoggerFactory.getLogger(SmsService.class);

    @Autowired
    private SmsLogRepository smsLogRepository;

    public void sendSms(User user, String phoneNumber, String message, String type) {
        logger.info("==========================================");
        logger.info("SIMULATED SMS DISPATCHED");
        logger.info("To: " + phoneNumber + " (" + user.getUsername() + ")");
        logger.info("Type: " + type);
        logger.info("Message: " + message);
        logger.info("==========================================");

        SmsLog log = SmsLog.builder()
                .user(user)
                .phoneNumber(phoneNumber)
                .message(message)
                .type(type)
                .build();
        
        smsLogRepository.save(log);
    }
    
    public List<SmsLog> getAllSmsLogs() {
        return smsLogRepository.findAllByOrderByCreatedAtDesc();
    }
}
