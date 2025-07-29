package com.payflowapi.service;

import com.payflowapi.dto.LoginDto;
import com.payflowapi.dto.LoginResponse;
import com.payflowapi.entity.User;
import com.payflowapi.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service // 📌 Tells Spring that this is a service class
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public LoginResponse login(LoginDto dto) {
        // 🔍 Find user by username (email)
        User user = userRepository.findByUsername(dto.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ❌ Block login if user is disabled
        if (!user.isActive()) {
            throw new RuntimeException("User is disabled");
        }

        // ❌ Check password match
        if (!user.getPassword().equals(dto.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        // if (user.getActive() != null && !user.getActive()) {
        // throw new RuntimeException("User is disabled");
        // }

        // 🪪 Generate mock token (can be replaced with JWT later)
        String token = "mock-token";

        // ✅ Create LoginResponse and set name
        LoginResponse response = new LoginResponse(token, user.getRole(), user.isFirstLogin());
        response.setName(user.getName());
        // Set user id for manager users
        if (user.getRole() != null && user.getRole().equalsIgnoreCase("MANAGER")) {
            response.setId(user.getId());
        }
        return response;
    }

}
