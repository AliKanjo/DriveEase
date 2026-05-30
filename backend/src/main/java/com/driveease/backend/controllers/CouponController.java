package com.driveease.backend.controllers;

import com.driveease.backend.models.Coupon;
import com.driveease.backend.repositories.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    @Autowired
    private CouponRepository couponRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Coupon>> getAllCoupons() {
        return ResponseEntity.ok(couponRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Coupon> createCoupon(@RequestBody Coupon coupon) {
        return ResponseEntity.ok(couponRepository.save(coupon));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long id) {
        couponRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/validate/{code}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> validateCoupon(@PathVariable String code) {
        Optional<Coupon> couponOpt = couponRepository.findByCode(code.toUpperCase());
        
        if (couponOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid coupon code");
        }
        
        Coupon coupon = couponOpt.get();
        if (!coupon.getIsActive() || coupon.getExpiryDate().isBefore(LocalDate.now())) {
            return ResponseEntity.badRequest().body("Coupon has expired or is inactive");
        }
        
        return ResponseEntity.ok(coupon);
    }
}
