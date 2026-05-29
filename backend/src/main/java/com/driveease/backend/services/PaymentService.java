package com.driveease.backend.services;

import com.driveease.backend.dto.PaymentRequest;
import com.driveease.backend.models.Booking;
import com.driveease.backend.models.Payment;
import com.driveease.backend.models.User;
import com.driveease.backend.models.enums.BookingStatus;
import com.driveease.backend.models.enums.PaymentStatus;
import com.driveease.backend.repositories.BookingRepository;
import com.driveease.backend.repositories.PaymentRepository;
import com.driveease.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    public Payment processPayment(String username, PaymentRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to pay for this booking");
        }

        if (booking.getPayment() != null && booking.getPayment().getStatus() == PaymentStatus.SUCCESS) {
            throw new RuntimeException("Booking is already paid for");
        }

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setUser(user);
        payment.setAmount(booking.getTotalPrice());
        payment.setMethod(request.getMethod());
        
        // Simulate successful payment
        payment.setStatus(PaymentStatus.SUCCESS);

        booking.setStatus(BookingStatus.APPROVED);
        bookingRepository.save(booking);

        return paymentRepository.save(payment);
    }

    public List<Payment> getUserPayments(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return paymentRepository.findByUserId(user.getId());
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }
}
