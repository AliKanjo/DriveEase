package com.driveease.backend.dto;

import com.driveease.backend.models.enums.PaymentMethod;
import lombok.Data;

@Data
public class PaymentRequest {
    private Long bookingId;
    private PaymentMethod method;
}
