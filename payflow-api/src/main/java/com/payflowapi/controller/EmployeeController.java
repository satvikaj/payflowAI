package com.payflowapi.controller;

import com.payflowapi.dto.EmployeeDto;
import com.payflowapi.entity.Employee;
import com.payflowapi.entity.Project;
import com.payflowapi.entity.EmployeeLeave;
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

    @Autowired
    private com.payflowapi.repository.EmployeeLeaveRepository employeeLeaveRepository;

    @Autowired
    private com.payflowapi.repository.ProjectRepository projectRepository;

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
        employee.setManagerId(dto.getManagerId());

        employee.setHasExperience(dto.getHasExperience());
        // Map experiences from DTO to entity
        if (dto.getExperiences() != null && !dto.getExperiences().isEmpty()) {
            java.util.List<Employee.Experience> expList = new java.util.ArrayList<>();
            for (EmployeeDto.ExperienceDto expDto : dto.getExperiences()) {
                Employee.Experience exp = new Employee.Experience();
                exp.setYears(expDto.getYears());
                exp.setRole(expDto.getRole());
                exp.setCompany(expDto.getCompany());
                expList.add(exp);
            }
            employee.setExperiences(expList);
        }

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

    // --- Manager Dashboard Endpoints ---

    // 1. Get team members for a manager
    @GetMapping("/manager/{managerId}/team")
    public List<Employee> getTeamByManager(@PathVariable Long managerId) {
        return employeeRepository.findByManagerId(managerId);
    }

    // 2. Get leave requests for a manager's team
    @GetMapping("/manager/{managerId}/leaves")
    public List<EmployeeLeave> getTeamLeaves(@PathVariable Long managerId) {
        // This assumes you have EmployeeLeaveRepository and EmployeeLeave entity
        // and Employee has a managerId field
        List<Employee> team = employeeRepository.findByManagerId(managerId);
        List<Long> teamIds = team.stream().map(Employee::getId).toList();
        return employeeLeaveRepository.findByEmployeeIdIn(teamIds);
    }

    // 3. Get projects managed by a manager
    @GetMapping("/manager/{managerId}/projects")
    public List<Project> getProjectsByManager(@PathVariable Long managerId) {
        // This assumes you have ProjectRepository and Project entity with managerId
        return projectRepository.findByManagerId(managerId);
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