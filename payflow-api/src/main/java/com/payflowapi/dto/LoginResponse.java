package com.payflowapi.dto;

// ✅ DTO for sending login response to frontend
public class LoginResponse {

    private String token;       // 🔐 Authentication token (can be dummy or JWT)
    private String role;        // 👥 Role of the user (ADMIN, HR, MANAGER)
    private boolean firstLogin; // ✅ True if user must reset password on first login
    private String name;
    // ✅ Default constructor (required for serialization)
    public LoginResponse() {
    }

    // ✅ Constructor to initialize all fields
    public LoginResponse(String token, String role, boolean firstLogin) {
        this.token = token;
        this.role = role;
        this.firstLogin = firstLogin;
    }


    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    // ✅ Getter & Setter for token
    public String getToken() {
        return token;
    }
    public void setToken(String token) {
        this.token = token;
    }

    // ✅ Getter & Setter for role
    public String getRole() {
        return role;
    }
    public void setRole(String role) {
        this.role = role;
    }

    // ✅ Getter & Setter for firstLogin
    public boolean isFirstLogin() {
        return firstLogin;
    }
    public void setFirstLogin(boolean firstLogin) {
        this.firstLogin = firstLogin;
    }
}
