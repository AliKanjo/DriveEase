package com.driveease.backend.controllers;

import com.driveease.backend.models.User;
import com.driveease.backend.models.Vehicle;
import com.driveease.backend.models.WaitlistEntry;
import com.driveease.backend.repositories.UserRepository;
import com.driveease.backend.repositories.VehicleRepository;
import com.driveease.backend.repositories.WaitlistEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/waitlist")
public class WaitlistController {

    @Autowired
    private WaitlistEntryRepository waitlistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @PostMapping("/vehicle/{vehicleId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<WaitlistEntry> joinWaitlist(@PathVariable Long vehicleId, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElseThrow();
        
        WaitlistEntry entry = WaitlistEntry.builder()
                .vehicle(vehicle)
                .user(user)
                .notified(false)
                .build();
                
        return ResponseEntity.ok(waitlistRepository.save(entry));
    }
}
