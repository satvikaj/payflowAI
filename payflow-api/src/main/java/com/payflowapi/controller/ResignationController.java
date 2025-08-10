package com.payflowapi.controller;

import com.payflowapi.entity.EmployeeResignation;
import com.payflowapi.dto.ResignationStatsDto;
import com.payflowapi.service.ResignationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resignation")
@CrossOrigin(origins = "http://localhost:3000")
public class ResignationController {

    @Autowired
    private ResignationService resignationService;

    /**
     * Employee submits resignation request
     */
    @PostMapping("/submit")
    public ResponseEntity<?> submitResignation(@RequestBody Map<String, Object> request) {
        try {
            String employeeEmail = (String) request.get("employeeEmail");
            String requestedLastWorkingDayStr = (String) request.get("requestedLastWorkingDay");
            String reason = (String) request.get("reason");

            if (employeeEmail == null || requestedLastWorkingDayStr == null || reason == null) {
                return ResponseEntity.badRequest()
                        .body("Missing required fields: employeeEmail, requestedLastWorkingDay, reason");
            }

            LocalDate requestedLastWorkingDay = LocalDate.parse(requestedLastWorkingDayStr);

            // Validate future date
            if (requestedLastWorkingDay.isBefore(LocalDate.now().plusDays(1))) {
                return ResponseEntity.badRequest().body("Last working day must be at least tomorrow");
            }

            EmployeeResignation resignation = resignationService.submitResignation(employeeEmail,
                    requestedLastWorkingDay, reason);
            return ResponseEntity.ok(resignation);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error submitting resignation: " + e.getMessage());
        }
    }

    /**
     * Process resignation (Manager/HR approval)
     */
    @PostMapping("/{resignationId}/action")
    public ResponseEntity<?> processResignation(@PathVariable Long resignationId,
            @RequestBody Map<String, Object> request) {
        try {
            String action = (String) request.get("action");
            String comments = (String) request.get("comments");
            String processedBy = (String) request.get("processedBy");
            String approvedLastWorkingDayStr = (String) request.get("approvedLastWorkingDay");

            if (action == null || processedBy == null) {
                return ResponseEntity.badRequest().body("Missing required fields: action, processedBy");
            }

            LocalDate approvedLastWorkingDay = null;
            if (approvedLastWorkingDayStr != null && !approvedLastWorkingDayStr.isEmpty()) {
                approvedLastWorkingDay = LocalDate.parse(approvedLastWorkingDayStr);
            }

            EmployeeResignation resignation = resignationService.processResignation(
                    resignationId, action, comments, approvedLastWorkingDay, processedBy);

            return ResponseEntity.ok(resignation);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error processing resignation: " + e.getMessage());
        }
    }

    /**
     * Withdraw resignation (Employee)
     */
    @PostMapping("/{resignationId}/withdraw")
    public ResponseEntity<?> withdrawResignation(@PathVariable Long resignationId, @RequestParam String employeeEmail) {
        try {
            EmployeeResignation resignation = resignationService.withdrawResignation(resignationId, employeeEmail);
            return ResponseEntity.ok(resignation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error withdrawing resignation: " + e.getMessage());
        }
    }

    /**
     * Get employee's resignation history
     */
    @GetMapping("/history")
    public ResponseEntity<?> getResignationHistory(@RequestParam String email) {
        try {
            List<EmployeeResignation> resignations = resignationService.getResignationsByEmployee(email);
            return ResponseEntity.ok(resignations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching resignation history: " + e.getMessage());
        }
    }

    /**
     * Get pending resignations for manager
     */
    @GetMapping("/manager/{managerId}/pending")
    public ResponseEntity<?> getPendingResignationsForManager(@PathVariable Long managerId) {
        try {
            List<EmployeeResignation> resignations = resignationService.getPendingResignationsForManager(managerId);
            return ResponseEntity.ok(resignations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching pending resignations: " + e.getMessage());
        }
    }

    /**
     * Get all resignations for manager (team overview)
     */
    @GetMapping("/manager/{managerId}")
    public ResponseEntity<?> getAllResignationsForManager(@PathVariable Long managerId) {
        try {
            List<EmployeeResignation> resignations = resignationService.getAllResignationsForManager(managerId);
            return ResponseEntity.ok(resignations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching team resignations: " + e.getMessage());
        }
    }

    /**
     * Get all resignations (HR/Admin)
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllResignations() {
        try {
            List<EmployeeResignation> resignations = resignationService.getAllResignations();
            return ResponseEntity.ok(resignations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching all resignations: " + e.getMessage());
        }
    }

    /**
     * Get all pending resignations (HR/Admin)
     */
    @GetMapping("/all/pending")
    public ResponseEntity<?> getAllPendingResignations() {
        try {
            List<EmployeeResignation> resignations = resignationService.getAllPendingResignations();
            return ResponseEntity.ok(resignations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching pending resignations: " + e.getMessage());
        }
    }

    /**
     * Get resignation statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getResignationStats() {
        try {
            ResignationStatsDto stats = resignationService.getResignationStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching resignation stats: " + e.getMessage());
        }
    }

    /**
     * Update exit interview status
     */
    @PutMapping("/{resignationId}/exit-interview")
    public ResponseEntity<?> updateExitInterviewStatus(@PathVariable Long resignationId,
            @RequestParam boolean completed) {
        try {
            EmployeeResignation resignation = resignationService.updateExitInterviewStatus(resignationId, completed);
            return ResponseEntity.ok(resignation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating exit interview status: " + e.getMessage());
        }
    }

    /**
     * Update handover status
     */
    @PutMapping("/{resignationId}/handover")
    public ResponseEntity<?> updateHandoverStatus(@PathVariable Long resignationId, @RequestParam boolean completed) {
        try {
            EmployeeResignation resignation = resignationService.updateHandoverStatus(resignationId, completed);
            return ResponseEntity.ok(resignation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating handover status: " + e.getMessage());
        }
    }

    /**
     * Update asset return status
     */
    @PutMapping("/{resignationId}/assets")
    public ResponseEntity<?> updateAssetReturnStatus(@PathVariable Long resignationId, @RequestParam boolean returned) {
        try {
            EmployeeResignation resignation = resignationService.updateAssetReturnStatus(resignationId, returned);
            return ResponseEntity.ok(resignation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating asset return status: " + e.getMessage());
        }
    }

    /**
     * Get resignation details by ID
     */
    @GetMapping("/{resignationId}")
    public ResponseEntity<?> getResignationById(@PathVariable Long resignationId) {
        try {
            // This is a simple implementation - you might want to add service method for
            // this
            return ResponseEntity.ok("Feature not implemented yet - use other endpoints");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching resignation details: " + e.getMessage());
        }
    }
}
