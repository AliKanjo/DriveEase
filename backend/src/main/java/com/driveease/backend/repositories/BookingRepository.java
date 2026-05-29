package com.driveease.backend.repositories;

import com.driveease.backend.models.Booking;
import com.driveease.backend.models.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);
    List<Booking> findByVehicleId(Long vehicleId);
    List<Booking> findByStatus(BookingStatus status);
}
