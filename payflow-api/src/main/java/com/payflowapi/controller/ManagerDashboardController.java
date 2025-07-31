package com.payflowapi.controller;

import com.payflowapi.entity.Employee;
import com.payflowapi.entity.Project;
import com.payflowapi.entity.EmployeeLeave;
import com.payflowapi.entity.User;
import com.payflowapi.repository.EmployeeRepository;
import com.payflowapi.repository.EmployeeLeaveRepository;
import com.payflowapi.repository.ProjectRepository;
import com.payflowapi.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manager")
@CrossOrigin(origins = "http://localhost:3000")
public class ManagerDashboardController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmployeeLeaveRepository employeeLeaveRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    // Get manager details by ID
    @GetMapping("/{managerId}/details")
    public User getManagerDetails(@PathVariable Long managerId) {
        return userRepository.findById(managerId).orElse(null);
    }

    // 1. Get team members for a manager
    @GetMapping("/{managerId}/team")
    public List<Employee> getTeamByManager(@PathVariable Long managerId) {
        return employeeRepository.findByManagerId(managerId);
    }

    // 2. Get leave requests for a manager's team
    @GetMapping("/{managerId}/leaves")
    public List<EmployeeLeave> getTeamLeaves(@PathVariable Long managerId) {
        List<Employee> team = employeeRepository.findByManagerId(managerId);
        List<Long> teamIds = team.stream().map(Employee::getId).toList();
        return employeeLeaveRepository.findByEmployeeIdIn(teamIds);
    }

    // 3. Get projects managed by a manager
    @GetMapping("/{managerId}/projects")
    public List<Project> getProjectsByManager(@PathVariable Long managerId) {
        return projectRepository.findByManagerId(managerId);
    }
}
