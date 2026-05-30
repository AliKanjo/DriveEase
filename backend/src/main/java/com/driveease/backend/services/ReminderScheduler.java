package com.driveease.backend.services;

import com.driveease.backend.models.Booking;
import com.driveease.backend.models.enums.BookingStatus;
import com.driveease.backend.repositories.BookingRepository;
import com.driveease.backend.repositories.SmsLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class ReminderScheduler {

    private static final Logger logger = LoggerFactory.getLogger(ReminderScheduler.class);

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private SmsService smsService;

    @Autowired
    private SmsLogRepository smsLogRepository;

    // Run every minute for demonstration purposes
    @Scheduled(fixedRate = 60000)
    public void processReminders() {
        logger.info("Running scheduled reminder checks...");
        LocalDate tomorrow = LocalDate.now().plusDays(1);

        // Rental Reminders
        List<Booking> activeBookings = bookingRepository.findAll();
        for (Booking booking : activeBookings) {
            if (booking.getStatus() == BookingStatus.APPROVED || booking.getStatus() == BookingStatus.ACTIVE) {
                if (booking.getStartDate().isEqual(tomorrow)) {
                    // Check if already sent
                    boolean sent = smsLogRepository.existsByUserIdAndTypeAndMessageContaining(
                            booking.getUser().getId(), "RENTAL_REMINDER", "Booking #" + booking.getId());
                    if (!sent) {
                        String msg = "Reminder: Your rental for Booking #" + booking.getId() + " starts tomorrow! " +
                                booking.getVehicle().getBrand() + " " + booking.getVehicle().getModel();
                        smsService.sendSms(booking.getUser(), "555-0199", msg, "RENTAL_REMINDER");
                    }
                }
                
                // Return Reminders
                if (booking.getEndDate().isEqual(tomorrow)) {
                    boolean sent = smsLogRepository.existsByUserIdAndTypeAndMessageContaining(
                            booking.getUser().getId(), "RETURN_REMINDER", "Booking #" + booking.getId());
                    if (!sent) {
                        String msg = "Reminder: Your rental for Booking #" + booking.getId() + " is due for return tomorrow.";
                        smsService.sendSms(booking.getUser(), "555-0199", msg, "RETURN_REMINDER");
                    }
                }
            }
        }
    }
}
