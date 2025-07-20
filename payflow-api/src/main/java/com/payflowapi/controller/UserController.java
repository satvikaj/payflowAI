package com.payflowapi.controller;

import com.payflowapi.dto.LoginDto;
import com.payflowapi.dto.LoginResponse;
import com.payflowapi.entity.User;
import com.payflowapi.repository.UserRepository;
import com.payflowapi.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController // Marks this as a REST API controller
@RequestMapping("/api") // Base URL path for all endpoints in this class
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    // LOGIN endpoint
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginDto loginDto) {
        // Calls the login logic in the service and returns token, role, and firstLogin info

        return ResponseEntity.ok(userService.login(loginDto));
    }

    // RESET PASSWORD endpoint
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestBody Map<String, String> body,
            @RequestHeader("Authorization") String authHeader
    ) {
        String newPassword = body.get("newPassword");
        String token = authHeader.replace("Bearer ", ""); // Extract token from header

        // Find the user by username (token holds the username here)
        Optional<User> optionalUser = userRepository.findByUsername(token);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        // Update password and mark firstLogin as false
        User user = optionalUser.get();
        user.setPassword(newPassword);
        user.setFirstLogin(false);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }

    // ADD USER (Admin creates HR or Manager)
    @PostMapping("/admin/add-user")
    public ResponseEntity<?> addUser(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");
        String password = body.get("password");
        String role = body.get("role");

        // Check if user already exists
        if (userRepository.findByUsername(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "User with this email already exists"));
        }

        // Create and save the new user
        User user = new User();
        user.setName(name);
        user.setUsername(email); // username = email
        user.setPassword(password);
        user.setRole(role.toUpperCase());
        user.setFirstLogin(true); // Force password reset on first login

        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "User added successfully"));
    }
}
