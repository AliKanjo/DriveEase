package com.driveease.backend.controllers;

import com.driveease.backend.models.*;
import com.driveease.backend.models.enums.TicketStatus;
import com.driveease.backend.models.enums.Role;
import com.driveease.backend.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;
import java.time.temporal.ChronoUnit;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MaintenanceRecordRepository maintenanceRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @GetMapping("/revenue/monthly")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyRevenue() {
        List<Booking> bookings = bookingRepository.findAll();
        
        Map<Month, Double> revenueByMonth = new TreeMap<>();
        for (Booking b : bookings) {
            if ("COMPLETED".equals(b.getStatus()) || "ACTIVE".equals(b.getStatus())) {
                if (b.getStartDate() != null) {
                    Month month = b.getStartDate().getMonth();
                    revenueByMonth.put(month, revenueByMonth.getOrDefault(month, 0.0) + (b.getTotalPrice() != null ? b.getTotalPrice() : 0.0));
                }
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<Month, Double> entry : revenueByMonth.entrySet()) {
            Map<String, Object> map = new HashMap<>();
            map.put("month", entry.getKey().getDisplayName(TextStyle.SHORT, Locale.ENGLISH));
            map.put("revenue", entry.getValue());
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/branches")
    public ResponseEntity<List<Map<String, Object>>> getBranchPerformance() {
        List<Branch> branches = branchRepository.findAll();
        List<Booking> bookings = bookingRepository.findAll();
        List<Vehicle> vehicles = vehicleRepository.findAll();

        List<Map<String, Object>> result = new ArrayList<>();

        for (Branch branch : branches) {
            double revenue = bookings.stream()
                .filter(b -> b.getPickupBranch() != null && b.getPickupBranch().getId().equals(branch.getId()))
                .filter(b -> "COMPLETED".equals(b.getStatus()) || "ACTIVE".equals(b.getStatus()))
                .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() : 0.0)
                .sum();

            long activeRentals = bookings.stream()
                .filter(b -> b.getPickupBranch() != null && b.getPickupBranch().getId().equals(branch.getId()))
                .filter(b -> "ACTIVE".equals(b.getStatus()))
                .count();

            long vehiclesAvailable = vehicles.stream()
                .filter(v -> v.getCurrentBranch() != null && v.getCurrentBranch().getId().equals(branch.getId()))
                .filter(v -> "AVAILABLE".equals(v.getStatus().name()))
                .count();

            Map<String, Object> map = new HashMap<>();
            map.put("branch", branch.getName());
            map.put("revenue", revenue);
            map.put("activeRentals", activeRentals);
            map.put("vehiclesAvailable", vehiclesAvailable);
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/customers")
    public ResponseEntity<Map<String, Object>> getCustomerAnalytics() {
        List<User> customers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.CUSTOMER)
                .collect(Collectors.toList());
        List<Booking> bookings = bookingRepository.findAll();

        long totalCustomers = customers.size();
        Set<Long> activeCustomerIds = bookings.stream()
                .filter(b -> "ACTIVE".equals(b.getStatus()))
                .map(b -> b.getUser().getId())
                .collect(Collectors.toSet());
        long activeCustomers = activeCustomerIds.size();

        Map<Long, Long> rentalsPerUser = bookings.stream()
                .collect(Collectors.groupingBy(b -> b.getUser().getId(), Collectors.counting()));

        long repeatCustomers = rentalsPerUser.values().stream().filter(count -> count > 1).count();
        double averageRentals = rentalsPerUser.isEmpty() ? 0 : (double) bookings.size() / totalCustomers;

        Map<String, Object> result = new HashMap<>();
        result.put("totalCustomers", totalCustomers);
        result.put("activeCustomers", activeCustomers);
        result.put("repeatCustomers", repeatCustomers);
        result.put("averageRentals", String.format("%.1f", averageRentals));

        return ResponseEntity.ok(result);
    }

    @GetMapping("/maintenance")
    public ResponseEntity<Map<String, Object>> getMaintenanceAnalytics() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        List<MaintenanceRecord> records = maintenanceRepository.findAll();

        long underMaintenance = vehicles.stream()
                .filter(v -> "MAINTENANCE".equals(v.getStatus().name()))
                .count();

        long completedRepairs = records.size();
        double maintenanceCost = records.stream()
                .mapToDouble(r -> r.getCost() != null ? r.getCost() : 0.0)
                .sum();

        Map<String, Object> result = new HashMap<>();
        result.put("underMaintenance", underMaintenance);
        result.put("completedRepairs", completedRepairs);
        result.put("maintenanceCost", maintenanceCost);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/top-customers")
    public ResponseEntity<List<Map<String, Object>>> getTopCustomers() {
        List<Booking> bookings = bookingRepository.findAll();
        Map<User, Double> revenuePerUser = new HashMap<>();
        Map<User, Integer> rentalsPerUser = new HashMap<>();

        for (Booking b : bookings) {
            if ("COMPLETED".equals(b.getStatus()) || "ACTIVE".equals(b.getStatus())) {
                User u = b.getUser();
                revenuePerUser.put(u, revenuePerUser.getOrDefault(u, 0.0) + (b.getTotalPrice() != null ? b.getTotalPrice() : 0.0));
                rentalsPerUser.put(u, rentalsPerUser.getOrDefault(u, 0) + 1);
            }
        }

        List<Map<String, Object>> result = revenuePerUser.entrySet().stream()
                .sorted(Map.Entry.<User, Double>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("customer", e.getKey().getUsername());
                    map.put("rentals", rentalsPerUser.getOrDefault(e.getKey(), 0));
                    map.put("revenue", e.getValue());
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/vehicle-profitability")
    public ResponseEntity<List<Map<String, Object>>> getVehicleProfitability() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        List<Booking> bookings = bookingRepository.findAll();
        List<MaintenanceRecord> records = maintenanceRepository.findAll();

        List<Map<String, Object>> result = new ArrayList<>();

        for (Vehicle v : vehicles) {
            double revenue = bookings.stream()
                    .filter(b -> b.getVehicle() != null && b.getVehicle().getId().equals(v.getId()))
                    .filter(b -> "COMPLETED".equals(b.getStatus()) || "ACTIVE".equals(b.getStatus()))
                    .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() : 0.0)
                    .sum();

            double cost = records.stream()
                    .filter(r -> r.getVehicle() != null && r.getVehicle().getId().equals(v.getId()))
                    .mapToDouble(r -> r.getCost() != null ? r.getCost() : 0.0)
                    .sum();

            double profit = revenue - cost;

            Map<String, Object> map = new HashMap<>();
            map.put("vehicle", v.getBrand() + " " + v.getModel());
            map.put("revenue", revenue);
            map.put("cost", cost);
            map.put("profit", profit);
            result.add(map);
        }

        result.sort((m1, m2) -> Double.compare((Double) m2.get("profit"), (Double) m1.get("profit")));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/support")
    public ResponseEntity<Map<String, Object>> getSupportAnalytics() {
        List<Ticket> tickets = ticketRepository.findAll();

        long openTickets = tickets.stream().filter(t -> t.getStatus() == TicketStatus.OPEN).count();
        long closedTickets = tickets.stream().filter(t -> t.getStatus() == TicketStatus.CLOSED || t.getStatus() == TicketStatus.RESOLVED).count();

        long totalResolutionHours = 0;
        int resolvedCount = 0;

        Map<String, Integer> issueTypes = new HashMap<>();

        for (Ticket t : tickets) {
            if (t.getResolvedAt() != null && t.getCreatedAt() != null) {
                long hours = ChronoUnit.HOURS.between(t.getCreatedAt(), t.getResolvedAt());
                totalResolutionHours += hours;
                resolvedCount++;
            }
            
            // Simple logic: first word of subject as issue type
            String subject = t.getSubject();
            if (subject != null && !subject.trim().isEmpty()) {
                String type = subject.split(" ")[0];
                issueTypes.put(type, issueTypes.getOrDefault(type, 0) + 1);
            }
        }

        String averageResolutionTime = resolvedCount > 0 ? (totalResolutionHours / resolvedCount) + " hours" : "N/A";
        
        String mostCommonIssue = issueTypes.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");

        Map<String, Object> result = new HashMap<>();
        result.put("openTickets", openTickets);
        result.put("closedTickets", closedTickets);
        result.put("averageResolutionTime", averageResolutionTime);
        result.put("mostCommonIssue", mostCommonIssue);

        return ResponseEntity.ok(result);
    }
}
