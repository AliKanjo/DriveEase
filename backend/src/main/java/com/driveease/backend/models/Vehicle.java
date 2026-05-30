package com.driveease.backend.models;

import com.driveease.backend.models.enums.VehicleStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "branch_id")
    private Branch currentBranch;

    @Column(nullable = false)
    private String brand;

    @Column(nullable = false)
    private String model;

    @Column(name = "model_year")
    private Integer year;

    @Column(name = "price_per_day", nullable = false)
    private Double pricePerDay;

    @Column(name = "fuel_type")
    private String fuelType;

    private String transmission;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleStatus status;

    @Column(length = 1000)
    private String description;

    @Column(name = "images", columnDefinition = "TEXT")
    private String images; // Stored as comma-separated URLs or JSON string for simplicity

    private Integer capacity;
    
    private Integer mileage;
    
    private String location;
    
    @Column(columnDefinition = "TEXT")
    private String features;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL)
    @JsonIgnore
    @ToString.Exclude
    @Builder.Default
    private List<Booking> bookings = new ArrayList<>();
}
