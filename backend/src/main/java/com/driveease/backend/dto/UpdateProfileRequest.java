package com.driveease.backend.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String email;
    private String gender;
}
