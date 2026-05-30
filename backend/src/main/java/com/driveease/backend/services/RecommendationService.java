package com.driveease.backend.services;

import com.driveease.backend.models.Booking;
import com.driveease.backend.models.Vehicle;
import com.driveease.backend.models.User;
import com.driveease.backend.repositories.BookingRepository;
import com.driveease.backend.repositories.VehicleRepository;
import com.driveease.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Vehicle> getRecommendedVehicles(String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return vehicleRepository.findAll().stream().limit(3).collect(Collectors.toList());
        }

        List<Booking> userBookings = bookingRepository.findByUserId(user.getId());
        
        // If user has no bookings, recommend the most popular vehicles overall
        if (userBookings.isEmpty()) {
            return getMostPopularVehicles();
        }

        // Recommend based on the most frequent transmission or fuel type the user books
        long automaticCount = userBookings.stream().filter(b -> "Automatic".equalsIgnoreCase(b.getVehicle().getTransmission())).count();
        long manualCount = userBookings.stream().filter(b -> "Manual".equalsIgnoreCase(b.getVehicle().getTransmission())).count();
        
        String preferredTransmission = automaticCount >= manualCount ? "Automatic" : "Manual";

        List<Vehicle> recommendations = vehicleRepository.findAll().stream()
                .filter(v -> preferredTransmission.equalsIgnoreCase(v.getTransmission()))
                .filter(v -> "AVAILABLE".equals(v.getStatus().name()))
                .limit(4)
                .collect(Collectors.toList());

        if (recommendations.isEmpty()) {
            return getMostPopularVehicles();
        }

        return recommendations;
    }

    private List<Vehicle> getMostPopularVehicles() {
        return vehicleRepository.findAll().stream()
                .filter(v -> "AVAILABLE".equals(v.getStatus().name()))
                .limit(4)
                .collect(Collectors.toList());
    }
}
