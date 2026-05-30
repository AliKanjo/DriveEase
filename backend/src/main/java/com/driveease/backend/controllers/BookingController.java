package com.driveease.backend.controllers;

import com.driveease.backend.dto.BookingRequest;
import com.driveease.backend.dto.UpdateBookingRequest;
import com.driveease.backend.models.Booking;
import com.driveease.backend.models.enums.BookingStatus;
import com.driveease.backend.services.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<Booking> createBooking(Authentication authentication, @RequestBody BookingRequest request) {
        return new ResponseEntity<>(bookingService.createBooking(authentication.getName(), request), HttpStatus.CREATED);
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<List<Booking>> getMyBookings(Authentication authentication) {
        return ResponseEntity.ok(bookingService.getUserBookings(authentication.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<Booking> updateBookingStatus(@PathVariable Long id, @RequestParam BookingStatus status) {
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, status));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<Booking> cancelBooking(@PathVariable Long id) {
        // Simple cancellation implementation
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, BookingStatus.CANCELLED));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<Booking> modifyBookingDates(Authentication authentication, @PathVariable Long id, @RequestBody UpdateBookingRequest request) {
        return ResponseEntity.ok(bookingService.updateBookingDates(id, authentication.getName(), request));
    }
}
