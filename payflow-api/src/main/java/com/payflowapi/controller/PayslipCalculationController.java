package com.payflowapi.controller;

import com.payflowapi.service.PayslipCalculationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payslip")
@CrossOrigin(origins = "http://localhost:3000")
public class PayslipCalculationController {

    @Autowired
    private PayslipCalculationService payslipCalculationService;

    /**
     * Calculate payslip for an employee for a specific month
     */
    @GetMapping("/calculate/{employeeId}/{year}/{month}")
    public ResponseEntity<Map<String, Object>> calculatePayslip(
            @PathVariable Long employeeId,
            @PathVariable int year,
            @PathVariable int month) {
        try {
            Map<String, Object> payslip = payslipCalculationService.calculateMonthlyPayslip(employeeId, year, month);
            return ResponseEntity.ok(payslip);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get working days in a specific month
     */
    @GetMapping("/working-days/{year}/{month}")
    public ResponseEntity<Integer> getWorkingDays(
            @PathVariable int year,
            @PathVariable int month) {
        try {
            int workingDays = payslipCalculationService.calculateWorkingDaysInMonth(year, month);
            return ResponseEntity.ok(workingDays);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get unpaid leave days for an employee in a specific month
     */
    @GetMapping("/unpaid-leaves/{employeeId}/{year}/{month}")
    public ResponseEntity<Integer> getUnpaidLeaveDays(
            @PathVariable Long employeeId,
            @PathVariable int year,
            @PathVariable int month) {
        try {
            int unpaidDays = payslipCalculationService.calculateUnpaidLeaveDaysInMonth(employeeId, year, month);
            return ResponseEntity.ok(unpaidDays);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
