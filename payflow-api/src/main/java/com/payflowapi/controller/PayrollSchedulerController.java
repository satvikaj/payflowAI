package com.payflowapi.controller;

import com.payflowapi.service.PayslipService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller for manual payroll scheduling operations
 * Provides endpoints for HR to manually trigger payroll generation
 */
@RestController
@RequestMapping("/api/payroll/scheduler")
@CrossOrigin(origins = "*")
public class PayrollSchedulerController {

    private static final Logger logger = LoggerFactory.getLogger(PayrollSchedulerController.class);

    @Autowired
    private PayslipService payslipService;

    /**
     * Manually trigger payroll generation for current month
     * POST /api/payroll/scheduler/generate-current-month
     */
    @PostMapping("/generate-current-month")
    public ResponseEntity<Map<String, Object>> generateCurrentMonthPayroll(@RequestParam String generatedBy) {
        try {
            LocalDate currentDate = LocalDate.now();
            String currentMonth = currentDate.format(DateTimeFormatter.ofPattern("MMMM"));
            Integer currentYear = currentDate.getYear();

            logger.info("Manual payroll generation triggered by {} for {} {}", generatedBy, currentMonth, currentYear);

            var generatedPayslips = payslipService.generateBulkPayslips(currentMonth, currentYear, generatedBy);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payroll generated successfully");
            response.put("month", currentMonth);
            response.put("year", currentYear);
            response.put("payslipsGenerated", generatedPayslips.size());
            response.put("generatedBy", generatedBy);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Failed to generate manual payroll: {}", e.getMessage(), e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to generate payroll: " + e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Manually trigger payroll generation for specific month/year
     * POST /api/payroll/scheduler/generate-specific
     */
    @PostMapping("/generate-specific")
    public ResponseEntity<Map<String, Object>> generateSpecificMonthPayroll(
            @RequestParam String month,
            @RequestParam Integer year,
            @RequestParam String generatedBy) {
        try {
            logger.info("Manual payroll generation triggered by {} for {} {}", generatedBy, month, year);

            var generatedPayslips = payslipService.generateBulkPayslips(month, year, generatedBy);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payroll generated successfully");
            response.put("month", month);
            response.put("year", year);
            response.put("payslipsGenerated", generatedPayslips.size());
            response.put("generatedBy", generatedBy);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Failed to generate manual payroll for {} {}: {}", month, year, e.getMessage(), e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to generate payroll: " + e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get scheduler status and next execution info
     * GET /api/payroll/scheduler/status
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSchedulerStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("schedulerEnabled", true);
        response.put("description", "Payroll scheduler runs automatically at 11:59 PM on the last day of each month");
        response.put("cronExpression", "0 59 23 L * ?");
        response.put("currentDate", LocalDate.now().toString());
        response.put("lastDayOfCurrentMonth",
                LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth()).toString());

        return ResponseEntity.ok(response);
    }
}
