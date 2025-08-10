package com.payflowapi.controller;

import com.payflowapi.entity.Employee;
import com.payflowapi.repository.EmployeeRepository;
import com.payflowapi.repository.PayslipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/payslip")
@CrossOrigin(origins = "http://localhost:3000")
public class PayslipController {

    @Autowired
    private PayslipRepository payslipRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    /**
     * Get all employees who have payslips
     */
    @GetMapping("/employees")
    public ResponseEntity<List<Employee>> getEmployeesWithPayslips() {
        try {
            // Get all distinct employee IDs from payslip table
            List<Long> employeeIds = payslipRepository.findDistinctEmployeeIds();

            // Fetch employee details for these IDs
            List<Employee> employeesWithPayslips = new ArrayList<>();
            for (Long employeeId : employeeIds) {
                Optional<Employee> employeeOpt = employeeRepository.findById(employeeId);
                if (employeeOpt.isPresent()) {
                    employeesWithPayslips.add(employeeOpt.get());
                }
            }

            return ResponseEntity.ok(employeesWithPayslips);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ArrayList<>());
        }
    }
}
