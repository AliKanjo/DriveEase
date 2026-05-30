package com.driveease.backend.controllers;

import com.driveease.backend.models.Branch;
import com.driveease.backend.repositories.BranchRepository;
import com.driveease.backend.services.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/branches")
public class BranchController {

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private AuditService auditService;

    @GetMapping
    public ResponseEntity<List<Branch>> getAllBranches() {
        return ResponseEntity.ok(branchRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Branch> createBranch(Authentication auth, @RequestBody Branch branch) {
        Branch saved = branchRepository.save(branch);
        auditService.logAction(auth.getName(), "CREATE_BRANCH", "Branch", String.valueOf(saved.getId()));
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBranch(Authentication auth, @PathVariable Long id) {
        branchRepository.deleteById(id);
        auditService.logAction(auth.getName(), "DELETE_BRANCH", "Branch", String.valueOf(id));
        return ResponseEntity.noContent().build();
    }
}
