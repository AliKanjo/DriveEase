package com.driveease.backend.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "damage_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DamageReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;

    private String reporterUsername; // Staff who reported it
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String severity; // MINOR, MODERATE, SEVERE

    private LocalDateTime reportDate;
    
    private Boolean isResolved = false;
}
