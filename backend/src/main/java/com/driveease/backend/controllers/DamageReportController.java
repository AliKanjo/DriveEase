package com.driveease.backend.controllers;

import com.driveease.backend.models.DamageReport;
import com.driveease.backend.models.Vehicle;
import com.driveease.backend.models.Booking;
import com.driveease.backend.repositories.DamageReportRepository;
import com.driveease.backend.repositories.VehicleRepository;
import com.driveease.backend.repositories.BookingRepository;
import com.driveease.backend.services.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/damage-reports")
@PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
public class DamageReportController {

    @Autowired
    private DamageReportRepository damageReportRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private AuditService auditService;

    @GetMapping
    public ResponseEntity<List<DamageReport>> getAllReports() {
        return ResponseEntity.ok(damageReportRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<DamageReport> createReport(Authentication auth, @RequestBody DamageReportRequest request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        
        Booking booking = null;
        if (request.getBookingId() != null) {
            booking = bookingRepository.findById(request.getBookingId()).orElse(null);
        }

        DamageReport report = new DamageReport();
        report.setVehicle(vehicle);
        report.setBooking(booking);
        report.setReporterUsername(auth.getName());
        report.setDescription(request.getDescription());
        report.setSeverity(request.getSeverity());
        report.setReportDate(LocalDateTime.now());
        report.setIsResolved(false);

        DamageReport saved = damageReportRepository.save(report);
        auditService.logAction(auth.getName(), "CREATE_DAMAGE_REPORT", "DamageReport", String.valueOf(saved.getId()));
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<DamageReport> resolveReport(Authentication auth, @PathVariable Long id) {
        DamageReport report = damageReportRepository.findById(id).orElseThrow(() -> new RuntimeException("Report not found"));
        report.setIsResolved(true);
        DamageReport saved = damageReportRepository.save(report);
        auditService.logAction(auth.getName(), "RESOLVE_DAMAGE_REPORT", "DamageReport", String.valueOf(saved.getId()));
        return ResponseEntity.ok(saved);
    }

    public static class DamageReportRequest {
        private Long vehicleId;
        private Long bookingId;
        private String description;
        private String severity;
        
        // Getters and Setters
        public Long getVehicleId() { return vehicleId; }
        public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
        public Long getBookingId() { return bookingId; }
        public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }
    }
}
