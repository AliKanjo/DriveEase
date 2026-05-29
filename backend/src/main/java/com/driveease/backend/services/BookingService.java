package com.driveease.backend.services;

import com.driveease.backend.dto.BookingRequest;
import com.driveease.backend.models.Booking;
import com.driveease.backend.models.User;
import com.driveease.backend.models.Vehicle;
import com.driveease.backend.models.enums.BookingStatus;
import com.driveease.backend.models.enums.VehicleStatus;
import com.driveease.backend.repositories.BookingRepository;
import com.driveease.backend.repositories.UserRepository;
import com.driveease.backend.repositories.VehicleRepository;
import com.driveease.backend.models.Notification;
import com.driveease.backend.repositories.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    public Booking createBooking(String username, BookingRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        if (vehicle.getStatus() != VehicleStatus.AVAILABLE) {
            throw new RuntimeException("Vehicle is not available for booking");
        }

        long days = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate());
        if (days <= 0) days = 1;

        Double totalPrice = days * vehicle.getPricePerDay();

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setVehicle(vehicle);
        booking.setStartDate(request.getStartDate());
        booking.setEndDate(request.getEndDate());
        booking.setTotalPrice(totalPrice);
        booking.setStatus(BookingStatus.PENDING);

        // Optional: mark vehicle as reserved/rented depending on logic.
        // vehicle.setStatus(VehicleStatus.RENTED);
        // vehicleRepository.save(vehicle);

        Booking savedBooking = bookingRepository.save(booking);

        Notification notif = Notification.builder()
                .user(user)
                .message("Your reservation for " + vehicle.getBrand() + " " + vehicle.getModel() + " has been successfully created and is pending approval.")
                .isRead(false)
                .build();
        notificationRepository.save(notif);

        return savedBooking;
    }

    public List<Booking> getUserBookings(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepository.findByUserId(user.getId());
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking updateBookingStatus(Long id, BookingStatus status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(status);
        
        if (status == BookingStatus.ACTIVE || status == BookingStatus.APPROVED) {
            Vehicle vehicle = booking.getVehicle();
            vehicle.setStatus(VehicleStatus.RENTED);
            vehicleRepository.save(vehicle);
        } else if (status == BookingStatus.COMPLETED || status == BookingStatus.CANCELLED) {
            Vehicle vehicle = booking.getVehicle();
            vehicle.setStatus(VehicleStatus.AVAILABLE);
            vehicleRepository.save(vehicle);
        }
        
        Booking savedBooking = bookingRepository.save(booking);

        String message = "Your reservation #" + booking.getId() + " status is now " + status.name();
        if (status == BookingStatus.APPROVED) {
            message = "Good news! Your reservation #" + booking.getId() + " has been approved. Please proceed to payment.";
        }
        
        Notification notif = Notification.builder()
                .user(booking.getUser())
                .message(message)
                .isRead(false)
                .build();
        notificationRepository.save(notif);
        
        return savedBooking;
    }

    public Booking modifyBookingDates(Long id, LocalDate startDate, LocalDate endDate) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.APPROVED) {
            throw new RuntimeException("Can only modify pending or approved bookings");
        }
        
        long days = ChronoUnit.DAYS.between(startDate, endDate);
        if (days <= 0) days = 1;
        
        Double totalPrice = days * booking.getVehicle().getPricePerDay();
        
        booking.setStartDate(startDate);
        booking.setEndDate(endDate);
        booking.setTotalPrice(totalPrice);
        
        return bookingRepository.save(booking);
    }
}
