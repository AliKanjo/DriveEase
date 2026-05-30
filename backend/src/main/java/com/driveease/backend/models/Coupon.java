package com.driveease.backend.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "coupons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code; // e.g. "SUMMER20"

    @Column(nullable = false)
    private Double discountPercentage; // e.g. 20.0 for 20% off

    @Column(nullable = false)
    private LocalDate expiryDate;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
