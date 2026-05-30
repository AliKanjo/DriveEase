package com.driveease.backend.controllers;

import java.time.LocalDateTime;
import java.util.Random;

import com.driveease.backend.dto.JwtAuthResponse;
import com.driveease.backend.dto.LoginRequest;
import com.driveease.backend.dto.RegisterRequest;
import com.driveease.backend.dto.ForgotPasswordRequest;
import com.driveease.backend.dto.UpdateProfileRequest;
import com.driveease.backend.models.User;
import com.driveease.backend.models.enums.Role;
import com.driveease.backend.models.Notification;
import com.driveease.backend.repositories.NotificationRepository;
import com.driveease.backend.repositories.UserRepository;
import com.driveease.backend.security.JwtTokenProvider;
import com.driveease.backend.services.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private AuditService auditService;

    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtTokenProvider.generateToken(authentication);
        
        User user = userRepository.findByUsername(loginRequest.getUsername()).orElseThrow();
        
        if (user.getRole() == Role.ADMIN || user.getRole() == Role.EMPLOYEE) {
            String code = String.format("%06d", new Random().nextInt(999999));
            user.setTwoFactorCode(code);
            user.setTwoFactorExpiry(LocalDateTime.now().plusMinutes(5));
            userRepository.save(user);
            System.out.println(">>> 2FA CODE FOR " + user.getUsername() + ": " + code + " <<<");
            
            JwtAuthResponse response = new JwtAuthResponse();
            response.setAccessToken("REQUIRE_2FA");
            response.setUsername(user.getUsername());
            response.setRole(user.getRole().name());
            response.setDev2faCode(code); // Return code for local dev auto-fill
            return ResponseEntity.ok(response);
        }

        JwtAuthResponse response = new JwtAuthResponse();
        response.setAccessToken(token);
        response.setUsername(user.getUsername());
        response.setRole(user.getRole().name());

        auditService.logAction(user.getUsername(), "LOGIN", "User", String.valueOf(user.getId()));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-2fa")
    public ResponseEntity<?> verifyTwoFactor(@RequestBody TwoFactorRequest request) {
        User user = userRepository.findByUsername(request.getUsername()).orElseThrow();
        
        if (user.getTwoFactorCode() == null || !user.getTwoFactorCode().equals(request.getCode()) || 
            user.getTwoFactorExpiry() == null || user.getTwoFactorExpiry().isBefore(LocalDateTime.now())) {
            return new ResponseEntity<>("Invalid or expired 2FA code", HttpStatus.UNAUTHORIZED);
        }

        user.setTwoFactorCode(null);
        user.setTwoFactorExpiry(null);
        userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtTokenProvider.generateToken(authentication);

        JwtAuthResponse response = new JwtAuthResponse();
        response.setAccessToken(token);
        response.setUsername(user.getUsername());
        response.setRole(user.getRole().name());

        auditService.logAction(user.getUsername(), "LOGIN_2FA", "User", String.valueOf(user.getId()));

        return ResponseEntity.ok(response);
    }

    public static class TwoFactorRequest {
        private String username;
        private String password;
        private String code;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return new ResponseEntity<>("Username is already taken!", HttpStatus.BAD_REQUEST);
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return new ResponseEntity<>("Email is already taken!", HttpStatus.BAD_REQUEST);
        }

        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPasswordHash(passwordEncoder.encode(registerRequest.getPassword()));
        
        user.setGender(registerRequest.getGender());
        try {
            if (registerRequest.getRole() != null && !registerRequest.getRole().isEmpty()) {
                user.setRole(Role.valueOf(registerRequest.getRole().toUpperCase()));
            } else {
                user.setRole(Role.CUSTOMER);
            }
        } catch (Exception e) {
            user.setRole(Role.CUSTOMER);
        }

        userRepository.save(user);

        Notification welcomeNotif = Notification.builder()
                .user(user)
                .message("Welcome to DriveEase! Your account has been created.")
                .isRead(false)
                .build();
        notificationRepository.save(welcomeNotif);

        auditService.logAction(user.getUsername(), "REGISTER", "User", String.valueOf(user.getId()));

        return new ResponseEntity<>("User registered successfully", HttpStatus.OK);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        User user = userRepository.findByUsername(request.getUsername()).orElse(null);
        if (user == null) {
            return new ResponseEntity<>("Username not found", HttpStatus.BAD_REQUEST);
        }

        if (!user.getEmail().equalsIgnoreCase(request.getEmail())) {
            return new ResponseEntity<>("Email does not match our records for this username", HttpStatus.BAD_REQUEST);
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return new ResponseEntity<>("Password reset successfully", HttpStatus.OK);
    }
}
