package com.driveease.backend.repositories;

import com.driveease.backend.models.PricingRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PricingRuleRepository extends JpaRepository<PricingRule, Long> {
    
    @Query("SELECT p FROM PricingRule p WHERE p.startDate <= :date AND p.endDate >= :date")
    List<PricingRule> findActiveRulesForDate(LocalDate date);
}
