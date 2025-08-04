package com.payflowapi.controller;

import com.payflowapi.entity.CTCDetails;
import com.payflowapi.entity.Employee;
import com.payflowapi.entity.Payslip;
import com.payflowapi.repository.EmployeeRepository;
import com.payflowapi.service.CTCService;
import com.payflowapi.service.PayslipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/ctc-management")
@CrossOrigin
public class CTCManagementController {

    @Autowired
    private CTCService ctcService;

    @Autowired
    private PayslipService payslipService;

    @Autowired
    private EmployeeRepository employeeRepository;

    // ==================== CTC MANAGEMENT ====================

    // Add new CTC for employee
    @PostMapping("/ctc/add")
    public ResponseEntity<?> addCTC(@RequestBody CTCDetails ctcDetails) {
        try {
            CTCDetails savedCTC = ctcService.addCTC(ctcDetails);
            return ResponseEntity.ok(Map.of(
                    "message", "CTC added successfully",
                    "ctc", savedCTC));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Update CTC
    @PutMapping("/ctc/update/{ctcId}")
    public ResponseEntity<?> updateCTC(@PathVariable Long ctcId, @RequestBody CTCDetails ctcDetails) {
        try {
            CTCDetails updatedCTC = ctcService.updateCTC(ctcId, ctcDetails);
            return ResponseEntity.ok(Map.of(
                    "message", "CTC updated successfully",
                    "ctc", updatedCTC));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Get current CTC for employee
    @GetMapping("/ctc/employee/{employeeId}")
    public ResponseEntity<?> getCurrentCTC(@PathVariable Long employeeId) {
        try {
            Optional<CTCDetails> ctc = ctcService.getCurrentCTC(employeeId);
            if (ctc.isPresent()) {
                return ResponseEntity.ok(ctc.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "No active CTC found for employee"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Get CTC history for employee
    @GetMapping("/ctc/history/{employeeId}")
    public ResponseEntity<?> getCTCHistory(@PathVariable Long employeeId) {
        try {
            List<CTCDetails> history = ctcService.getCTCHistory(employeeId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Get all active CTCs
    @GetMapping("/ctc/all")
    public ResponseEntity<?> getAllActiveCTCs() {
        try {
            List<CTCDetails> ctcs = ctcService.getAllActiveCTCs();
            return ResponseEntity.ok(ctcs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Delete CTC
    @DeleteMapping("/ctc/delete/{ctcId}")
    public ResponseEntity<?> deleteCTC(@PathVariable Long ctcId) {
        try {
            ctcService.deleteCTC(ctcId);
            return ResponseEntity.ok(Map.of("message", "CTC deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // ==================== PAYSLIP MANAGEMENT ====================

    // Generate payslip for employee
    @PostMapping("/payslip/generate")
    public ResponseEntity<?> generatePayslip(@RequestBody Map<String, Object> request) {
        try {
            // Handle null checks and field name mapping
            Object empIdObj = request.get("employeeId");
            Object monthObj = request.get("payrollMonth") != null ? request.get("payrollMonth") : request.get("month");
            Object yearObj = request.get("payrollYear") != null ? request.get("payrollYear") : request.get("year");
            Object generatedByObj = request.get("generatedBy");

            if (empIdObj == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Employee ID is required"));
            }
            if (monthObj == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Month is required"));
            }
            if (yearObj == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Year is required"));
            }

            Long employeeId = Long.valueOf(empIdObj.toString());
            String month = monthObj.toString();
            Integer year = Integer.valueOf(yearObj.toString());
            String generatedBy = generatedByObj != null ? generatedByObj.toString() : "SYSTEM";

            Payslip payslip = payslipService.generatePayslip(employeeId, month, year, generatedBy);
            return ResponseEntity.ok(Map.of(
                    "message", "Payslip generated successfully",
                    "payslip", payslip));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Generate bulk payslips
    @PostMapping("/payslip/generate-bulk")
    public ResponseEntity<?> generateBulkPayslips(@RequestBody Map<String, Object> request) {
        try {
            // Handle null checks and field name mapping
            Object monthObj = request.get("payrollMonth") != null ? request.get("payrollMonth") : request.get("month");
            Object yearObj = request.get("payrollYear") != null ? request.get("payrollYear") : request.get("year");
            Object generatedByObj = request.get("generatedBy");

            if (monthObj == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Month is required"));
            }
            if (yearObj == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Year is required"));
            }

            String month = monthObj.toString();
            Integer year = Integer.valueOf(yearObj.toString());
            String generatedBy = generatedByObj != null ? generatedByObj.toString() : "SYSTEM";

            List<Payslip> payslips = payslipService.generateBulkPayslips(month, year, generatedBy);
            return ResponseEntity.ok(Map.of(
                    "message", payslips.size() + " payslips generated successfully",
                    "payslips", payslips));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Get all payslips
    @GetMapping("/payslip/all")
    public ResponseEntity<?> getAllPayslips() {
        try {
            List<Payslip> payslips = payslipService.getAllPayslips();
            return ResponseEntity.ok(payslips);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Get employee payslips
    @GetMapping("/payslip/employee/{employeeId}")
    public ResponseEntity<?> getEmployeePayslips(@PathVariable Long employeeId) {
        try {
            List<Payslip> payslips = payslipService.getEmployeePayslips(employeeId);
            return ResponseEntity.ok(payslips);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Get specific payslip
    @GetMapping("/payslip/employee/{employeeId}/{month}/{year}")
    public ResponseEntity<?> getPayslip(@PathVariable Long employeeId,
            @PathVariable String month,
            @PathVariable Integer year) {
        try {
            Optional<Payslip> payslip = payslipService.getPayslip(employeeId, month, year);
            if (payslip.isPresent()) {
                return ResponseEntity.ok(payslip.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Payslip not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Get payslips by month/year
    @GetMapping("/payslip/month/{month}/year/{year}")
    public ResponseEntity<?> getPayslipsByMonthYear(@PathVariable String month, @PathVariable Integer year) {
        try {
            List<Payslip> payslips = payslipService.getPayslipsByMonthYear(month, year);
            return ResponseEntity.ok(payslips);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Update payslip status
    @PutMapping("/payslip/status/{payslipId}")
    public ResponseEntity<?> updatePayslipStatus(@PathVariable Long payslipId,
            @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            Payslip updatedPayslip = payslipService.updatePayslipStatus(payslipId, status);
            return ResponseEntity.ok(Map.of(
                    "message", "Payslip status updated successfully",
                    "payslip", updatedPayslip));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Delete payslip
    @DeleteMapping("/payslip/delete/{payslipId}")
    public ResponseEntity<?> deletePayslip(@PathVariable Long payslipId) {
        try {
            payslipService.deletePayslip(payslipId);
            return ResponseEntity.ok(Map.of("message", "Payslip deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // ==================== UTILITY ENDPOINTS ====================

    // Get all employees for CTC management
    @GetMapping("/employees")
    public ResponseEntity<?> getAllEmployees() {
        try {
            List<Employee> employees = employeeRepository.findAll();
            return ResponseEntity.ok(employees);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Get employees with payslips
    @GetMapping("/employees/with-payslips")
    public ResponseEntity<?> getEmployeesWithPayslips() {
        try {
            List<Long> employeeIds = payslipService.getEmployeesWithPayslips();
            return ResponseEntity.ok(employeeIds);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Health check
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "OK",
                "service", "CTC Management",
                "timestamp", System.currentTimeMillis()));
    }

    // ==================== MANAGER TEAM ENDPOINTS ====================

    // Get team members for a manager
    @GetMapping("/manager/{managerId}/team-members")
    public ResponseEntity<?> getTeamMembers(@PathVariable Long managerId) {
        try {
            // For now, return all employees as team members
            // In a real application, you'd filter by manager relationship
            List<Employee> teamMembers = employeeRepository.findAll();
            return ResponseEntity.ok(teamMembers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Get team CTC data for a manager
    @GetMapping("/manager/{managerId}/team-ctc")
    public ResponseEntity<?> getTeamCTC(@PathVariable Long managerId) {
        try {
            // Get all active CTCs for team members
            List<CTCDetails> teamCTCs = ctcService.getAllActiveCTCs();
            return ResponseEntity.ok(teamCTCs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Get team payslips for a manager
    @GetMapping("/manager/{managerId}/team-payslips")
    public ResponseEntity<?> getTeamPayslips(@PathVariable Long managerId) {
        try {
            // Get all payslips for team members
            List<Payslip> teamPayslips = payslipService.getAllPayslips();
            return ResponseEntity.ok(teamPayslips);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}
