package com.driveease.backend.repositories;

import com.driveease.backend.models.ExtensionRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExtensionRequestRepository extends JpaRepository<ExtensionRequest, Long> {
    List<ExtensionRequest> findByStatus(String status);
}
