package com.driveease.backend.repositories;

import com.driveease.backend.models.DamageReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DamageReportRepository extends JpaRepository<DamageReport, Long> {
    List<DamageReport> findByVehicleId(Long vehicleId);
}
