package com.payflowapi.controller;

import com.payflowapi.dto.CTCCreationDto;
import com.payflowapi.entity.CTCDetails;
import com.payflowapi.entity.Employee;
import com.payflowapi.entity.Payslip;
import com.payflowapi.repository.CTCDetailsRepository;
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

    @Autowired
    private CTCDetailsRepository ctcDetailsRepository;

    // ==================== CTC MANAGEMENT ====================

    // Add new CTC with auto-calculation (simplified)
    @PostMapping("/ctc/add-auto")
    public ResponseEntity<?> addCTCWithAutoCalculation(@RequestBody CTCCreationDto ctcCreationDto) {
        try {
            // Fetch employee details
            Optional<Employee> employeeOpt = employeeRepository.findById(ctcCreationDto.getEmployeeId());
            if (!employeeOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Employee not found"));
            }

            Employee employee = employeeOpt.get();

            // Create CTC Details with auto-calculation
            CTCDetails ctcDetails = new CTCDetails();
            ctcDetails.setEmployeeId(employee.getId());
            ctcDetails.setEmployeeName(employee.getFullName());
            ctcDetails.setEmployeePosition(employee.getPosition());
            ctcDetails.setAnnualCtc(ctcCreationDto.getAnnualCtc());
            ctcDetails.setEffectiveFrom(ctcCreationDto.getEffectiveFrom());
            ctcDetails.setRevisionReason(ctcCreationDto.getRevisionReason());
            ctcDetails.setCreatedBy(ctcCreationDto.getCreatedBy());
            ctcDetails.setStatus("ACTIVE");

            // Auto-calculate components
            ctcDetails.calculateCTCStructure();

            CTCDetails savedCTC = ctcService.addCTC(ctcDetails);
            return ResponseEntity.ok(Map.of(
                    "message", "CTC added successfully with auto-calculated components",
                    "ctc", savedCTC));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Get employees for CTC creation dropdown - Manager sees only their team
    @GetMapping("/employees/dropdown")
    public ResponseEntity<?> getEmployeesForDropdown(@RequestParam(required = false) Long managerId) {
        try {
            List<Employee> employees;
            if (managerId != null) {
                // Manager can only see their team members
                employees = employeeRepository.findByManagerId(managerId);
            } else {
                // HR/Admin can see all employees
                employees = employeeRepository.findAll();
            }
            return ResponseEntity.ok(employees.stream()
                    .map(emp -> Map.of(
                            "id", emp.getId(),
                            "name", emp.getFullName(),
                            "position", emp.getPosition() != null ? emp.getPosition() : "Not Set"))
                    .toList());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Debug endpoint to check stored CTC data
    @GetMapping("/ctc/debug/{employeeId}")
    public ResponseEntity<?> debugCTCData(@PathVariable Long employeeId) {
        try {
            Optional<CTCDetails> ctcOpt = ctcService.getCurrentCTC(employeeId);
            if (ctcOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            CTCDetails ctc = ctcOpt.get();

            // Create detailed breakdown map
            Map<String, Object> breakdown = Map.of(
                    "employeeId", ctc.getEmployeeId(),
                    "employeeName", ctc.getEmployeeName(),
                    "annualCtc", ctc.getAnnualCtc(),
                    "earnings", Map.of(
                            "basicSalary", ctc.getBasicSalary(),
                            "hra", ctc.getHra(),
                            "conveyanceAllowance", ctc.getConveyanceAllowance(),
                            "medicalAllowance", ctc.getMedicalAllowance(),
                            "specialAllowance", ctc.getSpecialAllowance(),
                            "performanceBonus", ctc.getPerformanceBonus(),
                            "employerPfContribution", ctc.getEmployerPfContribution(),
                            "gratuity", ctc.getGratuity()),
                    "deductions", Map.of(
                            "employeePf", ctc.getEmployeePf(),
                            "professionalTax", ctc.getProfessionalTax(),
                            "tds", ctc.getTds(),
                            "insurancePremium", ctc.getInsurancePremium(),
                            "incomeTax", ctc.getIncomeTax()),
                    "calculated", Map.of(
                            "grossMonthlySalary", ctc.getGrossMonthlySalary(),
                            "totalMonthlyDeductions", ctc.getTotalMonthlyDeductions(),
                            "netMonthlySalary", ctc.getNetMonthlySalary()),
                    "metadata", Map.of(
                            "effectiveFrom", ctc.getEffectiveFrom(),
                            "status", ctc.getStatus(),
                            "createdAt", ctc.getCreatedAt()));

            return ResponseEntity.ok(breakdown);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

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

    // Download payslip as PDF
    @GetMapping("/payslip/download/{payslipId}")
    public ResponseEntity<?> downloadPayslip(@PathVariable Long payslipId) {
        try {
            Optional<Payslip> payslipOpt = payslipService.getPayslipById(payslipId);
            if (!payslipOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Payslip not found"));
            }

            Payslip payslip = payslipOpt.get();
            // Return payslip data with employee information for frontend PDF generation
            Employee employee = employeeRepository.findById(payslip.getEmployeeId()).orElse(null);

            return ResponseEntity.ok(Map.of(
                    "payslip", payslip,
                    "employee", employee,
                    "message", "Payslip data retrieved successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // ==================== UTILITY ENDPOINTS ====================

    // Get all employees for CTC management - Manager sees only their team
    @GetMapping("/employees")
    public ResponseEntity<?> getAllEmployees(@RequestParam(required = false) Long managerId) {
        try {
            List<Employee> employees;
            if (managerId != null) {
                // Manager can only see their team members
                employees = employeeRepository.findByManagerId(managerId);
            } else {
                // HR/Admin can see all employees
                employees = employeeRepository.findAll();
            }
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
            // Return only employees managed by this manager
            List<Employee> teamMembers = employeeRepository.findByManagerId(managerId);
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
            // Get team members first
            List<Employee> teamMembers = employeeRepository.findByManagerId(managerId);
            List<Long> teamMemberIds = teamMembers.stream().map(Employee::getId).toList();

            // Get active CTCs only for team members
            List<CTCDetails> allActiveCTCs = ctcService.getAllActiveCTCs();
            List<CTCDetails> teamCTCs = allActiveCTCs.stream()
                    .filter(ctc -> teamMemberIds.contains(ctc.getEmployeeId()))
                    .toList();

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
            // Get team members first
            List<Employee> teamMembers = employeeRepository.findByManagerId(managerId);
            List<Long> teamMemberIds = teamMembers.stream().map(Employee::getId).toList();

            // Get payslips only for team members
            List<Payslip> allPayslips = payslipService.getAllPayslips();
            List<Payslip> teamPayslips = allPayslips.stream()
                    .filter(payslip -> teamMemberIds.contains(payslip.getEmployeeId()))
                    .toList();

            return ResponseEntity.ok(teamPayslips);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Recalculate existing CTC records with updated logic
    @PostMapping("/ctc/recalculate/{employeeId}")
    public ResponseEntity<?> recalculateEmployeeCTC(@PathVariable Long employeeId) {
        try {
            // Get current CTC
            Optional<CTCDetails> currentCTC = ctcService.getCurrentCTC(employeeId);
            if (currentCTC.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "No active CTC found for employee"));
            }

            CTCDetails ctc = currentCTC.get();
            // Recalculate using the updated logic
            ctc.calculateCTCStructure();

            // Save the updated values using the repository directly
            CTCDetails updatedCTC = ctcDetailsRepository.save(ctc);

            return ResponseEntity.ok(Map.of(
                    "message", "CTC recalculated successfully",
                    "updatedCTC", updatedCTC));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Recalculate all existing CTC records
    @PostMapping("/ctc/recalculate/all")
    public ResponseEntity<?> recalculateAllCTCs() {
        try {
            List<CTCDetails> allActiveCTCs = ctcService.getAllActiveCTCs();
            int recalculatedCount = 0;

            for (CTCDetails ctc : allActiveCTCs) {
                ctc.calculateCTCStructure();
                ctcDetailsRepository.save(ctc);
                recalculatedCount++;
            }

            return ResponseEntity.ok(Map.of(
                    "message", "All CTCs recalculated successfully",
                    "recalculatedCount", recalculatedCount));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}
