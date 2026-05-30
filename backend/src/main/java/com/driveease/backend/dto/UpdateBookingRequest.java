package com.driveease.backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class UpdateBookingRequest {
    private LocalDate startDate;
    private LocalDate endDate;

    private Long pickupBranchId;
    private Long returnBranchId;
}
