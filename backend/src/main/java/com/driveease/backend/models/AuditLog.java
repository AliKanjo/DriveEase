package com.driveease.backend.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreationTimestamp
    private LocalDateTime timestamp;

    private String username;
    
    private String action; // e.g., CREATE_BOOKING, LOGIN, UPDATE_VEHICLE
    
    private String entityName; // e.g., Booking, Vehicle, User
    
    private String entityId; // String in case ID is UUID or Long

}
