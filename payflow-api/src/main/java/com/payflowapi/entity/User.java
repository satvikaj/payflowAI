package com.payflowapi.entity;

import jakarta.persistence.*;

@Entity // 📌 Marks this class as a JPA entity (mapped to a DB table)
@Table(name = "users1") // 💾 Table name in the database will be `users`
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 🔢 Auto-generated primary key
    private Long id;

    private String name;        // 👤 Full name of the user (HR, Manager, etc.)
    private String username;    // 📧 Used as login ID (usually email)
    private String password;    // 🔐 User password
    private String role;        // 🎭 Role of the user (ADMIN, HR, MANAGER)

    @Column(name = "first_login") // ✅ Tracks if user has to reset password on first login
    private boolean firstLogin;

    // ✅ Getters and Setters (needed by Spring and for easy access)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public boolean isFirstLogin() {
        return firstLogin;
    }

    public void setFirstLogin(boolean firstLogin) {
        this.firstLogin = firstLogin;
    }
    @Column(name = "active")
    private Boolean active = true;

    public Boolean isActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

}
