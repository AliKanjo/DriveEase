package com.driveease.backend.controllers;

import com.driveease.backend.models.Coupon;
import com.driveease.backend.models.LoyaltyAccount;
import com.driveease.backend.models.User;
import com.driveease.backend.repositories.CouponRepository;
import com.driveease.backend.repositories.LoyaltyAccountRepository;
import com.driveease.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/loyalty")
public class LoyaltyController {

    @Autowired
    private LoyaltyAccountRepository loyaltyRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CouponRepository couponRepository;

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<LoyaltyAccount> getMyLoyaltyAccount(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        LoyaltyAccount account = loyaltyRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    LoyaltyAccount newAccount = LoyaltyAccount.builder().user(user).build();
                    return loyaltyRepository.save(newAccount);
                });
        return ResponseEntity.ok(account);
    }

    @PostMapping("/redeem")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> redeemPoints(@RequestParam Integer points, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        LoyaltyAccount account = loyaltyRepository.findByUserId(user.getId()).orElseThrow();
        
        if (points < 500) {
            return ResponseEntity.badRequest().body("Minimum 500 points required to redeem");
        }
        
        try {
            account.redeemPoints(points);
            loyaltyRepository.save(account);
            
            // Create a unique coupon code for the user
            String code = "RWD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            Double discount = (points / 100.0); // 500 points = 5% off
            
            Coupon coupon = Coupon.builder()
                .code(code)
                .discountPercentage(discount)
                .expiryDate(LocalDate.now().plusMonths(1))
                .isActive(true)
                .build();
                
            couponRepository.save(coupon);
            
            return ResponseEntity.ok(coupon);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
