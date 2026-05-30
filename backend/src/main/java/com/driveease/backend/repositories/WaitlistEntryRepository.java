package com.driveease.backend.repositories;

import com.driveease.backend.models.WaitlistEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WaitlistEntryRepository extends JpaRepository<WaitlistEntry, Long> {
    List<WaitlistEntry> findByVehicleIdAndNotifiedFalseOrderByCreatedAtAsc(Long vehicleId);
}
