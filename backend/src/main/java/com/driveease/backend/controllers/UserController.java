package com.driveease.backend.controllers;

import com.driveease.backend.dto.UpdateProfileRequest;
import com.driveease.backend.models.User;
import com.driveease.backend.repositories.UserRepository;
import com.driveease.backend.repositories.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import com.driveease.backend.services.AuditService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private AuditService auditService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.List<User>> getAllUsers() {
        java.util.List<User> users = userRepository.findAll();
        users.forEach(u -> u.setPasswordHash(null));
        return ResponseEntity.ok(users);
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Don't send password hash back
        user.setPasswordHash(null);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/me")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<?> updateProfile(Authentication authentication, @RequestBody UpdateProfileRequest request) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Basic validation - check if email is already taken by someone else
        if (!user.getEmail().equalsIgnoreCase(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email is already taken!");
        }

        user.setEmail(request.getEmail());
        user.setGender(request.getGender());
        userRepository.save(user);

        auditService.logAction(user.getUsername(), "UPDATE_PROFILE", "User", String.valueOf(user.getId()));

        user.setPasswordHash(null);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/me")
    @Transactional
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<String> deleteCurrentUser(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Free up any vehicles currently rented by this user
        if (user.getBookings() != null) {
            for (var booking : user.getBookings()) {
                if (booking.getStatus() == com.driveease.backend.models.enums.BookingStatus.ACTIVE || 
                    booking.getStatus() == com.driveease.backend.models.enums.BookingStatus.APPROVED) {
                    com.driveease.backend.models.Vehicle vehicle = booking.getVehicle();
                    if (vehicle != null) {
                        vehicle.setStatus(com.driveease.backend.models.enums.VehicleStatus.AVAILABLE);
                        vehicleRepository.save(vehicle);
                    }
                }
            }
        }

        auditService.logAction(user.getUsername(), "DELETE_ACCOUNT", "User", String.valueOf(user.getId()));
        userRepository.delete(user);
        return ResponseEntity.ok("Account deleted successfully");
    }
}
