package com.driveease.backend.controllers;

import com.driveease.backend.models.MaintenanceRecord;
import com.driveease.backend.models.Vehicle;
import com.driveease.backend.models.enums.VehicleStatus;
import com.driveease.backend.repositories.MaintenanceRecordRepository;
import com.driveease.backend.repositories.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
public class MaintenanceController {

    @Autowired
    private MaintenanceRecordRepository maintenanceRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<MaintenanceRecord>> getVehicleMaintenance(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(maintenanceRepository.findByVehicleIdOrderByMaintenanceDateDesc(vehicleId));
    }

    @PostMapping("/vehicle/{vehicleId}")
    public ResponseEntity<MaintenanceRecord> scheduleMaintenance(@PathVariable Long vehicleId, @RequestBody MaintenanceRecord request) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElseThrow();
        
        MaintenanceRecord record = MaintenanceRecord.builder()
                .vehicle(vehicle)
                .maintenanceDate(request.getMaintenanceDate())
                .description(request.getDescription())
                .cost(request.getCost())
                .build();
                
        // Automatically mark vehicle as in maintenance
        vehicle.setStatus(VehicleStatus.MAINTENANCE);
        vehicleRepository.save(vehicle);
        
        return ResponseEntity.ok(maintenanceRepository.save(record));
    }
    
    @PutMapping("/vehicle/{vehicleId}/complete")
    public ResponseEntity<Vehicle> completeMaintenance(@PathVariable Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElseThrow();
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        return ResponseEntity.ok(vehicleRepository.save(vehicle));
    }
}
