package com.driveease.backend.repositories;

import com.driveease.backend.models.MaintenanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRecordRepository extends JpaRepository<MaintenanceRecord, Long> {
    List<MaintenanceRecord> findByVehicleIdOrderByMaintenanceDateDesc(Long vehicleId);
}
