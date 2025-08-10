package com.payflowapi.controller;

import com.payflowapi.entity.Payslip;
import com.payflowapi.service.PaymentHoldService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payment-hold")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentHoldController {

    @Autowired
    private PaymentHoldService paymentHoldService;

    /**
     * Place payment hold on employee
     */
    @PostMapping("/place")
    public ResponseEntity<Map<String, Object>> placePaymentHold(@RequestBody Map<String, Object> request) {
        try {
            // Validate required fields
            if (request.get("employeeId") == null) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Employee ID is required"));
            }
            if (request.get("holdReason") == null || request.get("holdReason").toString().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Hold reason is required"));
            }

            Long employeeId = Long.valueOf(request.get("employeeId").toString());
            String holdReason = request.get("holdReason").toString();

            // Handle optional holdByUserId - default to 1 if not provided
            Long holdByUserId = 1L; // Default admin user ID
            if (request.get("holdByUserId") != null) {
                holdByUserId = Long.valueOf(request.get("holdByUserId").toString());
            }

            String holdByUserRole = "ADMIN"; // Default role
            if (request.get("holdByUserRole") != null) {
                holdByUserRole = request.get("holdByUserRole").toString();
            }

            // Get month and year from request, default to current month if not provided
            Integer holdMonth = null;
            Integer holdYear = null;

            if (request.containsKey("holdMonth") && request.get("holdMonth") != null) {
                holdMonth = Integer.valueOf(request.get("holdMonth").toString());
            }
            if (request.containsKey("holdYear") && request.get("holdYear") != null) {
                holdYear = Integer.valueOf(request.get("holdYear").toString());
            }

            String result = paymentHoldService.placePaymentHold(employeeId, holdReason, holdByUserId, holdByUserRole,
                    holdMonth, holdYear);

            if (result.contains("successfully")) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", result));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", result));
            }

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Error placing payment hold: " + e.getMessage()));
        }
    }

    /**
     * Release payment hold
     */
    @PostMapping("/release")
    public ResponseEntity<Map<String, Object>> releasePaymentHold(@RequestBody Map<String, Object> request) {
        try {
            Long employeeId = Long.valueOf(request.get("employeeId").toString());
            Long releasedByUserId = Long.valueOf(request.get("releasedByUserId").toString());
            String releasedByUserRole = (String) request.get("releasedByUserRole");

            String result = paymentHoldService.releasePaymentHold(employeeId, releasedByUserId, releasedByUserRole);

            if (result.contains("successfully")) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", result));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", result));
            }

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Error releasing payment hold: " + e.getMessage()));
        }
    }

    /**
     * Get all employees with payment holds (HR/Admin only)
     */
    @GetMapping("/list")
    public ResponseEntity<List<Payslip>> getEmployeesWithHolds() {
        try {
            List<Payslip> holdsPayslips = paymentHoldService.getEmployeesWithPaymentHolds();
            return ResponseEntity.ok(holdsPayslips);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    /**
     * Get payment hold status for specific employee
     */
    @GetMapping("/status/{employeeId}")
    public ResponseEntity<Map<String, Object>> getPaymentHoldStatus(@PathVariable Long employeeId) {
        try {
            Optional<Payslip> holdStatus = paymentHoldService.getPaymentHoldStatus(employeeId);

            if (holdStatus.isPresent()) {
                Payslip payslip = holdStatus.get();
                return ResponseEntity.ok(Map.of(
                        "isOnHold", true,
                        "holdReason", payslip.getHoldReason(),
                        "holdDate", payslip.getHoldDate(),
                        "holdByUserRole", payslip.getHoldByUserRole(),
                        "month", payslip.getMonth(),
                        "year", payslip.getYear(),
                        "payslip", payslip));
            } else {
                return ResponseEntity.ok(Map.of(
                        "isOnHold", false));
            }

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Error fetching payment hold status: " + e.getMessage()));
        }
    }
}
