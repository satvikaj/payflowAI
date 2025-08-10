package com.payflowapi.service;

import com.payflowapi.entity.Employee;
import com.payflowapi.entity.EmployeeResignation;
import com.payflowapi.dto.ResignationStatsDto;
import com.payflowapi.repository.EmployeeRepository;
import com.payflowapi.repository.EmployeeResignationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ResignationService {

    @Autowired
    private EmployeeResignationRepository resignationRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmailService emailService;

    /**
     * Submit a resignation request
     */
    public EmployeeResignation submitResignation(String employeeEmail, LocalDate requestedLastWorkingDay,
            String reason) {
        // Find employee details
        Optional<Employee> employeeOpt = employeeRepository.findByEmail(employeeEmail);
        if (employeeOpt.isEmpty()) {
            throw new RuntimeException("Employee not found with email: " + employeeEmail);
        }

        Employee employee = employeeOpt.get();

        // Check if employee already has an active resignation
        Optional<EmployeeResignation> activeResignation = resignationRepository
                .findActiveResignationByEmployeeId(employee.getId());
        if (activeResignation.isPresent()) {
            throw new RuntimeException(
                    "You already have an active resignation request. Status: " + activeResignation.get().getStatus());
        }

        // Create resignation request
        EmployeeResignation resignation = new EmployeeResignation(
                employee.getId(),
                employee.getFullName(),
                employee.getEmail(),
                employee.getDepartment(),
                employee.getRole(),
                employee.getPosition(),
                employee.getManagerId(),
                requestedLastWorkingDay,
                reason);

        // Save resignation
        EmployeeResignation savedResignation = resignationRepository.save(resignation);

        // Send notification email to manager
        sendResignationNotificationToManager(savedResignation);

        return savedResignation;
    }

    /**
     * Process resignation (Approve/Reject)
     */
    public EmployeeResignation processResignation(Long resignationId, String action, String comments,
            LocalDate approvedLastWorkingDay, String processedBy) {
        Optional<EmployeeResignation> resignationOpt = resignationRepository.findById(resignationId);
        if (resignationOpt.isEmpty()) {
            throw new RuntimeException("Resignation request not found");
        }

        EmployeeResignation resignation = resignationOpt.get();

        if (!"PENDING".equals(resignation.getStatus())) {
            throw new RuntimeException("Resignation request is not in pending status");
        }

        // Update resignation status
        if ("APPROVE".equalsIgnoreCase(action)) {
            resignation.setStatus("APPROVED");
            resignation.setApprovedLastWorkingDay(
                    approvedLastWorkingDay != null ? approvedLastWorkingDay : resignation.getRequestedLastWorkingDay());
            resignation.setManagerComments(comments);
            resignation.setProcessedBy(processedBy);

            // Send approval email to employee
            sendResignationApprovalEmail(resignation);

        } else if ("REJECT".equalsIgnoreCase(action)) {
            resignation.setStatus("REJECTED");
            resignation.setManagerComments(comments);
            resignation.setProcessedBy(processedBy);

            // Send rejection email to employee
            sendResignationRejectionEmail(resignation);
        } else {
            throw new RuntimeException("Invalid action. Use APPROVE or REJECT");
        }

        return resignationRepository.save(resignation);
    }

    /**
     * Withdraw resignation (by employee)
     */
    public EmployeeResignation withdrawResignation(Long resignationId, String employeeEmail) {
        Optional<EmployeeResignation> resignationOpt = resignationRepository.findById(resignationId);
        if (resignationOpt.isEmpty()) {
            throw new RuntimeException("Resignation request not found");
        }

        EmployeeResignation resignation = resignationOpt.get();

        if (!resignation.getEmployeeEmail().equals(employeeEmail)) {
            throw new RuntimeException("You can only withdraw your own resignation");
        }

        if (!"PENDING".equals(resignation.getStatus())) {
            throw new RuntimeException("Only pending resignations can be withdrawn");
        }

        resignation.setStatus("WITHDRAWN");
        return resignationRepository.save(resignation);
    }

    /**
     * Get resignation statistics
     */
    public ResignationStatsDto getResignationStats() {
        LocalDate today = LocalDate.now();

        ResignationStatsDto stats = new ResignationStatsDto();

        // Basic counts
        stats.setTotalResignations(resignationRepository.count());
        stats.setPendingResignations(resignationRepository.countByStatus("PENDING"));
        stats.setApprovedResignations(resignationRepository.countByStatus("APPROVED"));
        stats.setRejectedResignations(resignationRepository.countByStatus("REJECTED"));
        stats.setWithdrawnResignations(resignationRepository.countByStatus("WITHDRAWN"));

        // Monthly stats
        int currentYear = today.getYear();
        int currentMonth = today.getMonthValue();
        int lastMonth = currentMonth == 1 ? 12 : currentMonth - 1;
        int lastMonthYear = currentMonth == 1 ? currentYear - 1 : currentYear;

        stats.setResignationsThisMonth(
                resignationRepository.countApprovedResignationsByMonth(currentYear, currentMonth));
        stats.setResignationsLastMonth(
                resignationRepository.countApprovedResignationsByMonth(lastMonthYear, lastMonth));

        // Overdue resignations (pending for more than 5 days)
        LocalDateTime overdueDate = LocalDateTime.now().minusDays(5);
        stats.setOverdueResignations((long) resignationRepository.findOverdueResignations(overdueDate).size());

        // Exit interviews and handovers pending
        stats.setExitInterviewsPending((long) resignationRepository.findResignationsNeedingExitInterview(today).size());
        stats.setHandoversPending((long) resignationRepository.findResignationsWithIncompleteHandover(today).size());

        return stats;
    }

    /**
     * Get resignations by employee email
     */
    public List<EmployeeResignation> getResignationsByEmployee(String employeeEmail) {
        return resignationRepository.findByEmployeeEmailOrderByCreatedAtDesc(employeeEmail);
    }

    /**
     * Get pending resignations for manager
     */
    public List<EmployeeResignation> getPendingResignationsForManager(Long managerId) {
        return resignationRepository.findPendingResignationsByManager(managerId);
    }

    /**
     * Get all resignations for manager (team overview)
     */
    public List<EmployeeResignation> getAllResignationsForManager(Long managerId) {
        return resignationRepository.findByManagerIdOrderByCreatedAtDesc(managerId);
    }

    /**
     * Get all resignations for HR/Admin
     */
    public List<EmployeeResignation> getAllResignations() {
        return resignationRepository.findAll();
    }

    /**
     * Get all pending resignations for HR/Admin
     */
    public List<EmployeeResignation> getAllPendingResignations() {
        return resignationRepository.findAllPendingResignations();
    }

    /**
     * Update exit interview status
     */
    public EmployeeResignation updateExitInterviewStatus(Long resignationId, boolean completed) {
        Optional<EmployeeResignation> resignationOpt = resignationRepository.findById(resignationId);
        if (resignationOpt.isEmpty()) {
            throw new RuntimeException("Resignation request not found");
        }

        EmployeeResignation resignation = resignationOpt.get();
        resignation.setExitInterviewCompleted(completed);
        return resignationRepository.save(resignation);
    }

    /**
     * Update handover status
     */
    public EmployeeResignation updateHandoverStatus(Long resignationId, boolean completed) {
        Optional<EmployeeResignation> resignationOpt = resignationRepository.findById(resignationId);
        if (resignationOpt.isEmpty()) {
            throw new RuntimeException("Resignation request not found");
        }

        EmployeeResignation resignation = resignationOpt.get();
        resignation.setHandoverCompleted(completed);
        return resignationRepository.save(resignation);
    }

    /**
     * Update asset return status
     */
    public EmployeeResignation updateAssetReturnStatus(Long resignationId, boolean returned) {
        Optional<EmployeeResignation> resignationOpt = resignationRepository.findById(resignationId);
        if (resignationOpt.isEmpty()) {
            throw new RuntimeException("Resignation request not found");
        }

        EmployeeResignation resignation = resignationOpt.get();
        resignation.setAssetsReturned(returned);
        return resignationRepository.save(resignation);
    }

    // Email notification methods
    private void sendResignationNotificationToManager(EmployeeResignation resignation) {
        if (resignation.getManagerId() == null)
            return;

        Optional<Employee> managerOpt = employeeRepository.findById(resignation.getManagerId());
        if (managerOpt.isEmpty())
            return;

        Employee manager = managerOpt.get();
        String subject = "New Resignation Request - " + resignation.getEmployeeName();
        String body = String.format(
                "Dear %s,\n\n" +
                        "A new resignation request has been submitted by your team member.\n\n" +
                        "Employee: %s\n" +
                        "Department: %s\n" +
                        "Role: %s\n" +
                        "Resignation Date: %s\n" +
                        "Requested Last Working Day: %s\n" +
                        "Notice Period: %d days\n" +
                        "Reason: %s\n\n" +
                        "Please review and process this request through the PayFlow system.\n\n" +
                        "Best regards,\n" +
                        "PayFlow Team",
                manager.getFullName(),
                resignation.getEmployeeName(),
                resignation.getDepartment(),
                resignation.getRole(),
                resignation.getResignationDate(),
                resignation.getRequestedLastWorkingDay(),
                resignation.getActualNoticeDays(),
                resignation.getReason());

        emailService.sendNotificationEmail(manager.getEmail(), subject, body);
    }

    private void sendResignationApprovalEmail(EmployeeResignation resignation) {
        String subject = "Resignation Request Approved";
        String body = String.format(
                "Dear %s,\n\n" +
                        "Your resignation request has been approved.\n\n" +
                        "Details:\n" +
                        "Approved Last Working Day: %s\n" +
                        "Manager Comments: %s\n\n" +
                        "Please coordinate with HR for the exit process including:\n" +
                        "- Exit interview scheduling\n" +
                        "- Handover of responsibilities\n" +
                        "- Return of company assets\n\n" +
                        "Thank you for your contributions to the organization.\n\n" +
                        "Best regards,\n" +
                        "PayFlow Team",
                resignation.getEmployeeName(),
                resignation.getApprovedLastWorkingDay(),
                resignation.getManagerComments() != null ? resignation.getManagerComments() : "No additional comments");

        emailService.sendNotificationEmail(resignation.getEmployeeEmail(), subject, body);
    }

    private void sendResignationRejectionEmail(EmployeeResignation resignation) {
        String subject = "Resignation Request Status Update";
        String body = String.format(
                "Dear %s,\n\n" +
                        "Your resignation request has been reviewed.\n\n" +
                        "Status: Not Approved\n" +
                        "Comments: %s\n\n" +
                        "Please discuss with your manager if you have any questions.\n\n" +
                        "Best regards,\n" +
                        "PayFlow Team",
                resignation.getEmployeeName(),
                resignation.getManagerComments() != null ? resignation.getManagerComments() : "No comments provided");

        emailService.sendNotificationEmail(resignation.getEmployeeEmail(), subject, body);
    }
}
