package com.payflowapi.service;

import com.payflowapi.entity.Employee;
import com.payflowapi.entity.Payslip;
import com.payflowapi.entity.User;
import com.payflowapi.repository.EmployeeRepository;
import com.payflowapi.repository.PayslipRepository;
import com.payflowapi.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PaymentHoldService {

    @Autowired
    private PayslipRepository payslipRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    /**
     * Place a hold on employee's payment for a specific month
     */
    public String placePaymentHold(Long employeeId, String holdReason, Long holdByUserId, String holdByUserRole,
            Integer holdMonth, Integer holdYear) {
        try {
            System.out.println("DEBUG: placePaymentHold called with:");
            System.out.println("  - employeeId: " + employeeId);
            System.out.println("  - holdReason: " + holdReason);
            System.out.println("  - holdByUserId: " + holdByUserId);
            System.out.println("  - holdByUserRole: " + holdByUserRole);
            System.out.println("  - holdMonth: " + holdMonth);
            System.out.println("  - holdYear: " + holdYear);

            // Validate employee exists
            Optional<Employee> employeeOpt = employeeRepository.findById(employeeId);
            if (!employeeOpt.isPresent()) {
                System.out.println("DEBUG: Employee not found with ID: " + employeeId);
                return "Employee not found";
            }

            Employee employee = employeeOpt.get();
            System.out.println("DEBUG: Found employee: " + employee.getFullName());

            // Check role-based permissions
            if ("MANAGER".equals(holdByUserRole)) {
                if (!isManagerOfEmployee(holdByUserId, employeeId)) {
                    return "Managers can only hold payments for their team members";
                }
            }

            // If no month/year specified, use current month
            if (holdMonth == null || holdYear == null) {
                LocalDateTime now = LocalDateTime.now();
                holdMonth = now.getMonthValue();
                holdYear = now.getYear();
            }

            // Convert month number to month name for payslip lookup
            String monthName = getMonthName(holdMonth);

            // Find payslip record for the specific month and employee
            Optional<Payslip> payslipOpt = payslipRepository.findByEmployeeIdAndMonthAndYear(employeeId, monthName,
                    holdYear);
            System.out.println("DEBUG: Looking for payslip for employee " + employeeId + ", month: " + monthName
                    + ", year: " + holdYear);

            if (!payslipOpt.isPresent()) {
                System.out.println(
                        "DEBUG: No payslip found for employee " + employeeId + " for " + monthName + "/" + holdYear);

                // Check if there are any payslips for this employee
                List<Payslip> allPayslips = payslipRepository.findByEmployeeIdOrderByYearDescMonthDesc(employeeId);
                System.out.println(
                        "DEBUG: Found " + allPayslips.size() + " total payslips for employee ID: " + employeeId);

                if (allPayslips.isEmpty()) {
                    return "No payslips found for this employee";
                } else {
                    return String.format("No payslip found for %s %d. Available payslips: %s", monthName, holdYear,
                            allPayslips.stream().map(p -> p.getMonth() + "/" + p.getYear())
                                    .reduce((a, b) -> a + ", " + b).orElse("None"));
                }
            }

            Payslip targetPayslip = payslipOpt.get();
            System.out.println("DEBUG: Found payslip ID: " + targetPayslip.getPayslipId());

            // Check if payment is already on hold
            if (Boolean.TRUE.equals(targetPayslip.getIsOnHold())) {
                return String.format("Payment for %s %d is already on hold", monthName, holdYear);
            }

            // Check if payment is already processed (assuming DOWNLOADED means processed)
            if ("DOWNLOADED".equals(targetPayslip.getStatus())) {
                return String.format("Cannot hold payment for %s %d as it has already been processed", monthName,
                        holdYear);
            }

            // Place the hold
            targetPayslip.setIsOnHold(true);
            targetPayslip.setHoldReason(holdReason);
            targetPayslip.setHoldByUserId(holdByUserId);
            targetPayslip.setHoldByUserRole(holdByUserRole);
            targetPayslip.setHoldDate(LocalDateTime.now());
            targetPayslip.setHoldMonth(holdMonth);
            targetPayslip.setHoldYear(holdYear);
            targetPayslip.setStatus("ON_HOLD");

            payslipRepository.save(targetPayslip);

            // Send notification to employee
            notificationService.sendPaymentHoldNotification(employee, holdReason, holdByUserRole, holdMonth, holdYear);

            return String.format("Payment hold placed successfully for %s %d", monthName, holdYear);

        } catch (Exception e) {
            return "Error placing payment hold: " + e.getMessage();
        }
    }

    /**
     * Release payment hold
     */
    public String releasePaymentHold(Long employeeId, Long releasedByUserId, String releasedByUserRole) {
        try {
            // Get the latest payslip on hold for this employee
            List<Payslip> payslipsOnHold = payslipRepository
                    .findByEmployeeIdAndIsOnHoldTrueOrderByYearDescMonthDesc(employeeId);
            if (payslipsOnHold.isEmpty()) {
                return "No payment holds found for this employee";
            }

            Payslip latestPayslipOnHold = payslipsOnHold.get(0);

            // Check role-based permissions for release
            if ("MANAGER".equals(releasedByUserRole)) {
                if (!isManagerOfEmployee(releasedByUserId, employeeId)) {
                    return "Managers can only release holds for their team members";
                }
            }

            // Release the hold
            latestPayslipOnHold.setIsOnHold(false);
            latestPayslipOnHold.setHoldReason(null);
            latestPayslipOnHold.setHoldByUserId(null);
            latestPayslipOnHold.setHoldByUserRole(null);
            latestPayslipOnHold.setHoldDate(null);
            latestPayslipOnHold.setHoldMonth(null);
            latestPayslipOnHold.setHoldYear(null);
            latestPayslipOnHold.setStatus("GENERATED");

            payslipRepository.save(latestPayslipOnHold);

            // Send notification to employee
            Optional<Employee> employeeOpt = employeeRepository.findById(employeeId);
            if (employeeOpt.isPresent()) {
                notificationService.sendPaymentHoldReleaseNotification(employeeOpt.get(), releasedByUserRole);
            }

            return String.format("Payment hold released successfully for %s %d",
                    latestPayslipOnHold.getMonth(), latestPayslipOnHold.getYear());

        } catch (Exception e) {
            return "Error releasing payment hold: " + e.getMessage();
        }
    }

    /**
     * Get all employees with payment holds
     */
    public List<Payslip> getEmployeesWithPaymentHolds() {
        return payslipRepository.findByIsOnHoldTrue();
    }

    /**
     * Check if user is manager of the employee
     */
    private boolean isManagerOfEmployee(Long managerId, Long employeeId) {
        Optional<Employee> employeeOpt = employeeRepository.findById(employeeId);
        if (employeeOpt.isPresent()) {
            Employee employee = employeeOpt.get();
            return managerId.equals(employee.getManagerId());
        }
        return false;
    }

    /**
     * Get payment hold status for an employee
     */
    public Optional<Payslip> getPaymentHoldStatus(Long employeeId) {
        List<Payslip> payslipsOnHold = payslipRepository
                .findByEmployeeIdAndIsOnHoldTrueOrderByYearDescMonthDesc(employeeId);
        if (!payslipsOnHold.isEmpty()) {
            return Optional.of(payslipsOnHold.get(0));
        }
        return Optional.empty();
    }

    /**
     * Convert month number to month name
     */
    private String getMonthName(Integer monthNumber) {
        String[] months = { "", "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December" };
        if (monthNumber >= 1 && monthNumber <= 12) {
            return months[monthNumber];
        }
        return "Unknown";
    }
}
