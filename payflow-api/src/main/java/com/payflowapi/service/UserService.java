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

    // 🔐 Login method to validate username and password
    public LoginResponse login(LoginDto dto) {
        // 🔍 Find user by username (email)
        User user = userRepository.findByUsername(dto.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ❌ Check password match
        if (!user.getPassword().equals(dto.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // 🪪 Generate mock token (can be replaced with JWT later)
        String token = "mock-token";

        // ✅ Create LoginResponse and set name
        LoginResponse response = new LoginResponse(token, user.getRole(), user.isFirstLogin());
        response.setName(user.getName()); // 👈 Add name to the response

        return response;
    }
}





//package com.payflowapi.service;
//
//import com.payflowapi.dto.LoginDto;
//import com.payflowapi.dto.LoginResponse;
//import com.payflowapi.entity.User;
//import com.payflowapi.repository.UserRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//@Service // 📌 Tells Spring that this is a service class
//public class UserService {
//
//    @Autowired
//    private UserRepository userRepository;
//
//    // 🔐 Login method to validate username and password
//    public LoginResponse login(LoginDto dto) {
//        // 🔍 Find user by username (email)
//        User user = userRepository.findByUsername(dto.getUsername())
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        // ❌ Check password match
//        if (!user.getPassword().equals(dto.getPassword())) {
//            throw new RuntimeException("Invalid password");
//        }
//
//        // 🪪 Generate mock token (can be replaced with JWT later)
//        String token = "mock-token";
//
//        // ✅ Return LoginResponse (token, role, firstLogin)
//        return new LoginResponse(token, user.getRole(), user.isFirstLogin());
//    }
//}
