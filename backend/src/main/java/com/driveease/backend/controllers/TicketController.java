package com.driveease.backend.controllers;

import java.time.LocalDateTime;

import com.driveease.backend.models.Ticket;
import com.driveease.backend.models.TicketReply;
import com.driveease.backend.models.User;
import com.driveease.backend.models.enums.TicketPriority;
import com.driveease.backend.models.enums.TicketStatus;
import com.driveease.backend.models.Notification;
import com.driveease.backend.models.TicketReply;
import com.driveease.backend.repositories.NotificationRepository;
import com.driveease.backend.repositories.TicketReplyRepository;
import com.driveease.backend.repositories.TicketRepository;
import com.driveease.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private TicketReplyRepository ticketReplyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<Ticket>> getMyTickets(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(ticketRepository.findByUserIdOrderByCreatedAtDesc(user.getId()));
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Ticket> createTicket(@RequestBody Ticket ticketRequest, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        
        Ticket ticket = Ticket.builder()
                .user(user)
                .subject(ticketRequest.getSubject())
                .message(ticketRequest.getMessage())
                .status(TicketStatus.OPEN)
                .build();
                
        return ResponseEntity.ok(ticketRepository.save(ticket));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Ticket>> getAllTickets() {
        return ResponseEntity.ok(ticketRepository.findAllByOrderByCreatedAtDesc());
    }

    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Ticket> resolveTicket(@PathVariable Long id) {
        Ticket ticket = ticketRepository.findById(id).orElseThrow();
        ticket.setStatus(TicketStatus.RESOLVED);
        ticket.setResolvedAt(LocalDateTime.now());
        
        Notification notif = Notification.builder()
                .user(ticket.getUser())
                .message("Your support ticket #" + ticket.getId() + " has been resolved.")
                .isRead(false)
                .build();
        notificationRepository.save(notif);
        
        return ResponseEntity.ok(ticketRepository.save(ticket));
    }

    @PutMapping("/{id}/close")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Ticket> closeTicket(@PathVariable Long id) {
        Ticket ticket = ticketRepository.findById(id).orElseThrow();
        ticket.setStatus(TicketStatus.CLOSED);
        ticket.setResolvedAt(LocalDateTime.now());
        
        Notification notif = Notification.builder()
                .user(ticket.getUser())
                .message("Your support ticket #" + ticket.getId() + " has been closed.")
                .isRead(false)
                .build();
        notificationRepository.save(notif);
        
        return ResponseEntity.ok(ticketRepository.save(ticket));
    }

    @PutMapping("/{id}/priority")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Ticket> setPriority(@PathVariable Long id, @RequestParam TicketPriority priority) {
        Ticket ticket = ticketRepository.findById(id).orElseThrow();
        ticket.setPriority(priority);
        return ResponseEntity.ok(ticketRepository.save(ticket));
    }

    @GetMapping("/{id}/replies")
    public ResponseEntity<List<TicketReply>> getTicketReplies(@PathVariable Long id) {
        return ResponseEntity.ok(ticketReplyRepository.findByTicketIdOrderByCreatedAtAsc(id));
    }

    @PostMapping("/{id}/reply")
    public ResponseEntity<TicketReply> addReply(@PathVariable Long id, @RequestBody TicketReply replyRequest, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        Ticket ticket = ticketRepository.findById(id).orElseThrow();
        
        TicketReply reply = TicketReply.builder()
                .ticket(ticket)
                .user(user)
                .message(replyRequest.getMessage())
                .build();
                
        // If an admin replies, set status to PENDING
        if (user.getRole().name().equals("ADMIN")) {
            if (ticket.getStatus() == TicketStatus.OPEN) {
                ticket.setStatus(TicketStatus.PENDING);
                ticketRepository.save(ticket);
            }
            Notification notif = Notification.builder()
                    .user(ticket.getUser())
                    .message("An admin has replied to your support ticket #" + ticket.getId() + ".")
                    .isRead(false)
                    .build();
            notificationRepository.save(notif);
        }
        
        return ResponseEntity.ok(ticketReplyRepository.save(reply));
    }
}
