package com.payflowapi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration // Marks this class as a Spring configuration class
public class SecurityConfig {

    @Bean // Defines a security filter bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF protection (safe in development)
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll()); // ✅ Allow all requests without authentication

        return http.build(); // 🔧 Return the configured security filter
    }
}
