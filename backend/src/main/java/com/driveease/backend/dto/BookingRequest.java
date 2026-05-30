package com.driveease.backend.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class BookingRequest {
    private Long vehicleId;
    private LocalDate startDate;
    private LocalDate endDate;
    
    private Long pickupBranchId;
    private Long returnBranchId;
    private String couponCode;
}
