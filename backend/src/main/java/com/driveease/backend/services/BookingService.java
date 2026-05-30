package com.driveease.backend.services;

import com.driveease.backend.dto.BookingRequest;
import com.driveease.backend.dto.UpdateBookingRequest;
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
import com.driveease.backend.models.PricingRule;
import com.driveease.backend.repositories.PricingRuleRepository;
import com.driveease.backend.models.Coupon;
import com.driveease.backend.repositories.CouponRepository;
import com.driveease.backend.models.WaitlistEntry;
import com.driveease.backend.repositories.WaitlistEntryRepository;
import com.driveease.backend.models.LoyaltyAccount;
import com.driveease.backend.repositories.LoyaltyAccountRepository;
import com.driveease.backend.models.Branch;
import com.driveease.backend.repositories.BranchRepository;
import com.driveease.backend.services.AuditService;
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

    @Autowired
    private PricingRuleRepository pricingRuleRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private WaitlistEntryRepository waitlistRepository;

    @Autowired
    private LoyaltyAccountRepository loyaltyRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private AuditService auditService;

    public Booking createBooking(String username, BookingRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        if (vehicle.getStatus() != VehicleStatus.AVAILABLE) {
            throw new RuntimeException("Vehicle is not available for booking");
        }

        if (request.getPickupBranchId() == null || request.getReturnBranchId() == null) {
            throw new RuntimeException("Pickup and return branches must be specified");
        }

        if (vehicle.getCurrentBranch() == null || !vehicle.getCurrentBranch().getId().equals(request.getPickupBranchId())) {
            throw new RuntimeException("Strict Inventory Check Failed: Vehicle is not currently located at the specified pickup branch.");
        }

        Branch pickupBranch = branchRepository.findById(request.getPickupBranchId())
                .orElseThrow(() -> new RuntimeException("Pickup branch not found"));
        Branch returnBranch = branchRepository.findById(request.getReturnBranchId())
                .orElseThrow(() -> new RuntimeException("Return branch not found"));

        long days = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate());
        if (days <= 0) days = 1;

        Double totalPrice = days * vehicle.getPricePerDay();

        // Apply seasonal pricing multipliers
        List<PricingRule> activeRules = pricingRuleRepository.findActiveRulesForDate(request.getStartDate());
        for (PricingRule rule : activeRules) {
            totalPrice *= rule.getMultiplier();
        }

        // Apply coupon discount
        if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
            Coupon coupon = couponRepository.findByCode(request.getCouponCode().toUpperCase()).orElse(null);
            if (coupon != null && coupon.getIsActive() && !coupon.getExpiryDate().isBefore(LocalDate.now())) {
                totalPrice = totalPrice - (totalPrice * (coupon.getDiscountPercentage() / 100.0));
            }
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setVehicle(vehicle);
        booking.setPickupBranch(pickupBranch);
        booking.setReturnBranch(returnBranch);
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

        auditService.logAction(user.getUsername(), "CREATE_BOOKING", "Booking", String.valueOf(savedBooking.getId()));

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

    public Booking updateBookingDates(Long id, String username, UpdateBookingRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Not authorized to modify this booking");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only PENDING bookings can be modified");
        }

        long days = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate());
        if (days <= 0) days = 1;

        Double totalPrice = days * booking.getVehicle().getPricePerDay();

        // Apply seasonal pricing multipliers
        List<PricingRule> activeRules = pricingRuleRepository.findActiveRulesForDate(request.getStartDate());
        for (PricingRule rule : activeRules) {
            totalPrice *= rule.getMultiplier();
        }

        booking.setStartDate(request.getStartDate());
        booking.setEndDate(request.getEndDate());
        booking.setTotalPrice(totalPrice);
        
        if (request.getPickupBranchId() != null) {
            Branch pickupBranch = branchRepository.findById(request.getPickupBranchId())
                    .orElseThrow(() -> new RuntimeException("Pickup branch not found"));
            booking.setPickupBranch(pickupBranch);
        }
        if (request.getReturnBranchId() != null) {
            Branch returnBranch = branchRepository.findById(request.getReturnBranchId())
                    .orElseThrow(() -> new RuntimeException("Return branch not found"));
            booking.setReturnBranch(returnBranch);
        }

        Booking savedBooking = bookingRepository.save(booking);
        auditService.logAction(username, "UPDATE_BOOKING_DATES", "Booking", String.valueOf(savedBooking.getId()));
        return savedBooking;
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
            
            // Notify waitlist
            List<WaitlistEntry> waitlisted = waitlistRepository.findByVehicleIdAndNotifiedFalseOrderByCreatedAtAsc(vehicle.getId());
            for (WaitlistEntry entry : waitlisted) {
                Notification notif = Notification.builder()
                        .user(entry.getUser())
                        .message("The vehicle " + vehicle.getBrand() + " " + vehicle.getModel() + " is now available to book!")
                        .isRead(false)
                        .build();
                notificationRepository.save(notif);
                entry.setNotified(true);
                waitlistRepository.save(entry);
            }
            
            // Add loyalty points
            if (booking.getTotalPrice() != null) {
                User u = booking.getUser();
                LoyaltyAccount account = loyaltyRepository.findByUserId(u.getId())
                    .orElseGet(() -> LoyaltyAccount.builder().user(u).build());
                
                account.addPoints((int)(booking.getTotalPrice() / 10));
                loyaltyRepository.save(account);
            }
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
        
        auditService.logAction("SYSTEM/ADMIN", "UPDATE_BOOKING_STATUS_" + status.name(), "Booking", String.valueOf(savedBooking.getId()));

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
