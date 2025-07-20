package com.payflowapi.controller;

import com.payflowapi.dto.EmployeeDto;
import com.payflowapi.entity.Employee;
import com.payflowapi.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employee")
@CrossOrigin(origins = "http://localhost:3000") // Allow frontend access
public class EmployeeController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @PostMapping("/onboard")
    public Employee onboardEmployee(@RequestBody EmployeeDto dto) {
        Employee employee = new Employee();

        employee.setFullName(dto.getFullName());
        employee.setDepartment(dto.getDepartment());
        employee.setRole(dto.getRole());
        employee.setEmail(dto.getEmail());
        employee.setPhone(dto.getPhone());
        employee.setAddress(dto.getAddress());
        employee.setJoiningDate(dto.getJoiningDate());

        employee.setHasExperience(dto.getHasExperience());
        employee.setExperienceYears(dto.getExperienceYears());
        employee.setPreviousRole(dto.getPreviousRole());
        employee.setPreviousCompany(dto.getPreviousCompany());

        return employeeRepository.save(employee);
    }
    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }


}
