package com.payflowapi.controller;

import com.payflowapi.dto.EmployeeDto;
import com.payflowapi.entity.Employee;
import com.payflowapi.repository.EmployeeRepository;
import com.payflowapi.entity.User;
import com.payflowapi.repository.UserRepository;
import com.payflowapi.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import java.security.SecureRandom;

@RestController
@RequestMapping("/api/employee")
@CrossOrigin(origins = "http://localhost:3000") // Allow frontend access
public class EmployeeController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @PostMapping("/onboard")
    public Employee onboardEmployee(@RequestBody EmployeeDto dto) {
        Employee employee = new Employee();

        // Personal & Contact Info
        employee.setFullName(dto.getFullName());
        employee.setDob(dto.getDob());
        employee.setGender(dto.getGender());
        employee.setAddress(dto.getAddress());
        employee.setEmail(dto.getEmail());
        employee.setPhone(dto.getPhone());
        employee.setEmergencyContact(dto.getEmergencyContact());

        // Education
        employee.setQualification(dto.getQualification());
        employee.setInstitution(dto.getInstitution());
        employee.setGraduationYear(dto.getGraduationYear());
        employee.setSpecialization(dto.getSpecialization());

        // Job & Work Info
        employee.setDepartment(dto.getDepartment());
        employee.setRole(dto.getRole());
        employee.setJoiningDate(dto.getJoiningDate());

        employee.setHasExperience(dto.getHasExperience());
        employee.setExperienceYears(dto.getExperienceYears());
        employee.setPreviousRole(dto.getPreviousRole());
        employee.setPreviousCompany(dto.getPreviousCompany());

        // Skills & Certifications
        employee.setCertifications(dto.getCertifications());
        employee.setSkills(dto.getSkills());
        employee.setLanguages(dto.getLanguages());

        Employee savedEmployee = employeeRepository.save(employee);

        // --- Create User credentials for the employee ---
        // Generate a random 8-character password
        String defaultPassword = generateRandomPassword(8);

        User user = new User();
        user.setName(employee.getFullName());
        user.setUsername(employee.getEmail());
        user.setPassword(defaultPassword); // In production, hash this!
        user.setRole("EMPLOYEE");
        user.setFirstLogin(true);
        user.setActive(true);
        userRepository.save(user);

        // Send credentials to employee's email asynchronously
        new Thread(() -> {
            emailService.sendUserCredentials(employee.getEmail(), employee.getEmail(), defaultPassword);
        }).start();

        return savedEmployee;
    }

    // Helper to generate a random password
    private String generateRandomPassword(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$";
        SecureRandom rnd = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++)
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        return sb.toString();
    }

    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    // Endpoint to get employee by email
    @GetMapping(params = "email")
    public Employee getEmployeeByEmail(@RequestParam String email) {
        return employeeRepository.findByEmail(email).orElse(null);
    }

    // Endpoint to get the count of employees
    @GetMapping("/count")
    public long getEmployeeCount() {
        return employeeRepository.count();
    }
}