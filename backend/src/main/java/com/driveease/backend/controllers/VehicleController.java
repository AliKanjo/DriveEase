package com.driveease.backend.controllers;

import com.driveease.backend.models.Vehicle;
import com.driveease.backend.services.VehicleService;
import com.driveease.backend.services.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.driveease.backend.services.AuditService;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private AuditService auditService;

    @GetMapping
    public ResponseEntity<List<Vehicle>> getAllVehicles() {
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

    @GetMapping("/available")
    public ResponseEntity<List<Vehicle>> getAvailableVehicles() {
        return ResponseEntity.ok(vehicleService.getAvailableVehicles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicleById(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.getVehicleById(id));
    }

    @GetMapping("/recommended")
    public ResponseEntity<List<Vehicle>> getRecommendedVehicles(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(recommendationService.getRecommendedVehicles(username));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Vehicle> createVehicle(Authentication authentication, @RequestBody Vehicle vehicle) {
        Vehicle created = vehicleService.createVehicle(vehicle);
        auditService.logAction(authentication.getName(), "CREATE_VEHICLE", "Vehicle", String.valueOf(created.getId()));
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<Vehicle> updateVehicle(Authentication authentication, @PathVariable Long id, @RequestBody Vehicle vehicle) {
        Vehicle updated = vehicleService.updateVehicle(id, vehicle);
        auditService.logAction(authentication.getName(), "UPDATE_VEHICLE", "Vehicle", String.valueOf(updated.getId()));
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteVehicle(Authentication authentication, @PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        auditService.logAction(authentication.getName(), "DELETE_VEHICLE", "Vehicle", String.valueOf(id));
        return ResponseEntity.noContent().build();
    }
}
