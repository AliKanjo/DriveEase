package com.driveease.backend.controllers;

import com.driveease.backend.models.Booking;
import com.driveease.backend.models.ExtensionRequest;
import com.driveease.backend.repositories.BookingRepository;
import com.driveease.backend.repositories.ExtensionRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/extensions")
public class ExtensionController {

    @Autowired
    private ExtensionRequestRepository extensionRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @PostMapping("/booking/{bookingId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ExtensionRequest> requestExtension(@PathVariable Long bookingId, @RequestBody ExtensionRequest request) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow();
        
        ExtensionRequest extension = ExtensionRequest.builder()
                .booking(booking)
                .newEndDate(request.getNewEndDate())
                .status("PENDING")
                .build();
                
        return ResponseEntity.ok(extensionRepository.save(extension));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ExtensionRequest>> getPendingExtensions() {
        return ResponseEntity.ok(extensionRepository.findByStatus("PENDING"));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExtensionRequest> approveExtension(@PathVariable Long id) {
        ExtensionRequest extension = extensionRepository.findById(id).orElseThrow();
        Booking booking = extension.getBooking();
        
        // Update booking end date
        booking.setEndDate(extension.getNewEndDate());
        bookingRepository.save(booking);
        
        extension.setStatus("APPROVED");
        return ResponseEntity.ok(extensionRepository.save(extension));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExtensionRequest> rejectExtension(@PathVariable Long id) {
        ExtensionRequest extension = extensionRepository.findById(id).orElseThrow();
        extension.setStatus("REJECTED");
        return ResponseEntity.ok(extensionRepository.save(extension));
    }
}
