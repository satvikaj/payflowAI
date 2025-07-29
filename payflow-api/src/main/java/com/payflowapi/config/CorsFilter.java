package com.payflowapi.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component // Marks this as a Spring-managed component (auto-loaded)
public class CorsFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        // ✅ Allow frontend (React) to access backend (Spring Boot)
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000"); // Allow requests from React
        response.setHeader("Access-Control-Allow-Credentials", "true"); // Allow cookies/auth headers
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Allowed HTTP methods
        response.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization"); // Allowed headers

        // ✅ Handle preflight (OPTIONS) requests sent by browser before actual call
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK); // Return 200 OK for OPTIONS
        } else {
            chain.doFilter(req, res); // Continue normal processing
        }
    }
}
