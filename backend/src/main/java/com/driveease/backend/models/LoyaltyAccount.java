package com.driveease.backend.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "loyalty_accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoyaltyAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "bookings", "payments", "passwordHash"})
    private User user;

    @Column(nullable = false)
    @Builder.Default
    private Integer points = 0;

    @Column(nullable = false)
    @Builder.Default
    private String membershipLevel = "BRONZE"; // BRONZE, SILVER, GOLD, PLATINUM
    
    public void addPoints(Integer addedPoints) {
        this.points += addedPoints;
        updateLevel();
    }
    
    public void redeemPoints(Integer redeemedPoints) {
        if (this.points >= redeemedPoints) {
            this.points -= redeemedPoints;
            updateLevel();
        } else {
            throw new RuntimeException("Insufficient points");
        }
    }
    
    private void updateLevel() {
        if (this.points >= 10000) {
            this.membershipLevel = "PLATINUM";
        } else if (this.points >= 5000) {
            this.membershipLevel = "GOLD";
        } else if (this.points >= 1000) {
            this.membershipLevel = "SILVER";
        } else {
            this.membershipLevel = "BRONZE";
        }
    }
}
