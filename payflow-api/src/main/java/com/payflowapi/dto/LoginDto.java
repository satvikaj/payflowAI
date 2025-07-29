package com.payflowapi.dto;

// ✅ DTO for handling login request data from frontend
public class LoginDto {
    
    private String username;  // 👤 User's email or username (sent from frontend)
    private String password;  // 🔐 User's password

    // ✅ Getter for username
    public String getUsername() {
        return username;
    }

    // ✅ Setter for username
    public void setUsername(String username) {
        this.username = username;
    }

    // ✅ Getter for password
    public String getPassword() {
        return password;
    }

    // ✅ Setter for password
    public void setPassword(String password) {
        this.password = password;
    }
}
