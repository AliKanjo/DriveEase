package com.driveease.backend.controllers;

import com.driveease.backend.models.Review;
import com.driveease.backend.models.User;
import com.driveease.backend.models.Vehicle;
import com.driveease.backend.repositories.ReviewRepository;
import com.driveease.backend.repositories.UserRepository;
import com.driveease.backend.repositories.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<Review>> getVehicleReviews(@PathVariable Long vehicleId) {
        List<Review> reviews = reviewRepository.findByVehicleIdOrderByCreatedAtDesc(vehicleId);
        // Only return non-hidden reviews for the public
        return ResponseEntity.ok(reviews.stream().filter(r -> !r.isHidden()).toList());
    }

    @GetMapping("/vehicle/{vehicleId}/stats")
    public ResponseEntity<Map<String, Object>> getVehicleReviewStats(@PathVariable Long vehicleId) {
        List<Review> reviews = reviewRepository.findByVehicleIdOrderByCreatedAtDesc(vehicleId)
                .stream().filter(r -> !r.isHidden()).toList();
        
        double avg = 0;
        if (!reviews.isEmpty()) {
            avg = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        }
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("averageRating", avg);
        stats.put("totalReviews", reviews.size());
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/vehicle/{vehicleId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Review> createReview(@PathVariable Long vehicleId, @RequestBody Review reviewRequest, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElseThrow();

        Review review = Review.builder()
                .user(user)
                .vehicle(vehicle)
                .rating(reviewRequest.getRating())
                .comment(reviewRequest.getComment())
                .build();
        
        return ResponseEntity.ok(reviewRepository.save(review));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Review>> getAllReviews() {
        return ResponseEntity.ok(reviewRepository.findAllByOrderByCreatedAtDesc());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        reviewRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/hide")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> hideReview(@PathVariable Long id) {
        Review review = reviewRepository.findById(id).orElseThrow();
        review.setHidden(!review.isHidden());
        reviewRepository.save(review);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Review> editMyReview(@PathVariable Long id, @RequestBody Review reviewRequest, Authentication authentication) {
        Review review = reviewRepository.findById(id).orElseThrow();
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        
        if (!review.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }
        
        review.setRating(reviewRequest.getRating());
        review.setComment(reviewRequest.getComment());
        return ResponseEntity.ok(reviewRepository.save(review));
    }

    @DeleteMapping("/mine/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> deleteMyReview(@PathVariable Long id, Authentication authentication) {
        Review review = reviewRepository.findById(id).orElseThrow();
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        
        if (!review.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }
        
        reviewRepository.delete(review);
        return ResponseEntity.ok().build();
    }
}
