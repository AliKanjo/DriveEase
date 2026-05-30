package com.driveease.backend.controllers;

import com.driveease.backend.models.PricingRule;
import com.driveease.backend.repositories.PricingRuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pricing")
@PreAuthorize("hasRole('ADMIN')")
public class PricingController {

    @Autowired
    private PricingRuleRepository pricingRuleRepository;

    @GetMapping
    public ResponseEntity<List<PricingRule>> getAllRules() {
        return ResponseEntity.ok(pricingRuleRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<PricingRule> createRule(@RequestBody PricingRule rule) {
        return ResponseEntity.ok(pricingRuleRepository.save(rule));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRule(@PathVariable Long id) {
        pricingRuleRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
