package com.payflowapi.controller;

import com.payflowapi.dto.PayrollRequest;
import com.payflowapi.entity.Employee;
import com.payflowapi.entity.EmployeeLeave;
import com.payflowapi.entity.CTCDetails;
import com.payflowapi.entity.Payroll;
import com.payflowapi.repository.EmployeeLeaveRepository;
import com.payflowapi.repository.EmployeeRepository;
import com.payflowapi.repository.CTCDetailsRepository;
import com.payflowapi.repository.PayrollRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payrolls")
@CrossOrigin
public class PayrollController {

    @Autowired
    private PayrollRepository payrollRepo;

    @Autowired
    private EmployeeRepository employeeRepo;

    @Autowired
    private EmployeeLeaveRepository employeeLeaveRepo;

    @Autowired
    private CTCDetailsRepository ctcDetailsRepo;


    @GetMapping("/payslip")
    public ResponseEntity<Object> getPayslip(
            @RequestParam Long employeeId,
            @RequestParam String cycle
    ) {
        Payroll payroll = payrollRepo.findByEmployeeIdAndCycle(employeeId, cycle);
        if (payroll != null) {
            return ResponseEntity.ok(payroll);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Payslip not found.");
        }
    }


    @PostMapping("/schedule")
    public Payroll schedulePayroll(@RequestBody PayrollRequest req) {
        // Fetch employee
        Employee emp = employeeRepo.findById(req.getEmployeeId()).orElseThrow();

        // Get the payroll cycle month
        YearMonth cycleMonth = YearMonth.parse(req.getCycle());
        LocalDate startOfYear = LocalDate.of(cycleMonth.getYear(), 1, 1);
        LocalDate endOfCycleMonth = cycleMonth.atEndOfMonth();

        // Fetch all approved leaves from Jan 1st to end of cycle month
        List<EmployeeLeave> approvedLeaves = employeeLeaveRepo.findApprovedLeavesInMonth(
                emp.getId(), startOfYear, endOfCycleMonth);

        // Calculate total leave days so far in the year
        int totalLeaveDays = approvedLeaves.stream()
                .mapToInt(leave -> {
                    LocalDate from = leave.getFromDate().isBefore(startOfYear) ? startOfYear : leave.getFromDate();
                    LocalDate to = leave.getToDate().isAfter(endOfCycleMonth) ? endOfCycleMonth : leave.getToDate();
                    return from.isAfter(to) ? 0 : (int) (to.toEpochDay() - from.toEpochDay() + 1);
                })
                .sum();

        // Calculate excess leaves beyond annual limit
        int excessLeaveDays = Math.max(0, totalLeaveDays - 12);

        // Deduction logic
        BigDecimal baseSalary = req.getBaseSalary();
        BigDecimal deductionDecimal = BigDecimal.ZERO;

        if (excessLeaveDays > 0) {
            BigDecimal perDaySalary = baseSalary.divide(BigDecimal.valueOf(30), 2, BigDecimal.ROUND_HALF_UP);
            deductionDecimal = perDaySalary.multiply(BigDecimal.valueOf(excessLeaveDays));
        }

        BigDecimal finalSalary = baseSalary.subtract(deductionDecimal);

        // Build payroll object
        Payroll payroll = new Payroll();
        payroll.setEmployeeId(emp.getId());
        payroll.setDepartment(req.getDepartment());
        payroll.setBaseSalary(baseSalary);
        payroll.setNumberOfLeaves(totalLeaveDays);
        payroll.setDeductionAmount(deductionDecimal.doubleValue());
        payroll.setNetSalary(finalSalary.doubleValue());
        payroll.setCycle(req.getCycle());
        payroll.setStatus("Scheduled");
        payroll.setPaymentDate(req.getPaymentDate());

        return payrollRepo.save(payroll);
    }




//    @PostMapping("/schedule")
//    public Payroll schedulePayroll(@RequestBody PayrollRequest req) {
//        Employee emp = employeeRepo.findById(req.getEmployeeId()).orElseThrow();
//
//        // Get the cycle month (e.g., "2025-07") and compute previous month (e.g., "2025-06")
//        YearMonth currentCycle = YearMonth.parse(req.getCycle());
//        YearMonth targetMonth = currentCycle.minusMonths(1); // Previous month
//        LocalDate startOfTargetMonth = targetMonth.atDay(1); // 2025-07-01
//        LocalDate endOfTargetMonth = targetMonth.atEndOfMonth(); // 2025-07-31
//
//
//        // Fetch approved leaves in the previous month
//        List<EmployeeLeave> approvedLeaves = employeeLeaveRepo.findApprovedLeavesInMonth(
//                emp.getId(), startOfTargetMonth, endOfTargetMonth);
//
//        // Calculate total leave days that fall in the previous month
//        int totalLeaveDays = approvedLeaves.stream()
//                .mapToInt(leave -> {
//                    LocalDate from = leave.getFromDate().isBefore(startOfTargetMonth) ? startOfTargetMonth : leave.getFromDate();
//                    LocalDate to = leave.getToDate().isAfter(endOfTargetMonth) ? endOfTargetMonth : leave.getToDate();
//                    return from.isAfter(to) ? 0 : (int) (to.toEpochDay() - from.toEpochDay() + 1);
//                })
//                .sum();
//
//
//        // Deduction logic
//        double deduction = totalLeaveDays * 1000;
//        BigDecimal baseSalary = req.getBaseSalary();
//        BigDecimal deductionDecimal = BigDecimal.valueOf(deduction); // ✅ Convert to BigDecimal
//        BigDecimal finalSalary = baseSalary.subtract(deductionDecimal); // ✅ BigDecimal - BigDecimal
//
//        // Build Payroll object
//        Payroll payroll = new Payroll();
//        payroll.setEmployeeId(emp.getId());
//        payroll.setDepartment(req.getDepartment());
//        payroll.setBaseSalary(req.getBaseSalary());
//        payroll.setNumberOfLeaves(totalLeaveDays);
//        payroll.setDeductionAmount(deduction);
//        payroll.setNetSalary(finalSalary.doubleValue());                 // if your entity uses double
//
//        payroll.setCycle(req.getCycle());
//        payroll.setStatus("Scheduled");
//        payroll.setPaymentDate(req.getPaymentDate());
//
//        return payrollRepo.save(payroll);
//    }


    @GetMapping("/all")
    public List<Payroll> getAllPayrolls() {
        return payrollRepo.findAll();
    }

    @GetMapping("/employee/{empId}")
    public List<Payroll> getPayrollsByEmployee(@PathVariable Long empId) {
        return payrollRepo.findByEmployeeId(empId);
    }

    @PutMapping("/update-status/{payrollId}")
    public ResponseEntity<?> updateStatus(@PathVariable Long payrollId, @RequestParam String status) {
        var optionalPayroll = payrollRepo.findById(payrollId);

        if (optionalPayroll.isPresent()) {
            Payroll payroll = optionalPayroll.get();
            payroll.setStatus(status);
            Payroll updated = payrollRepo.save(payroll);
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Payroll with ID " + payrollId + " not found");
        }
    }

    // Dynamic payslip generation endpoint
    @GetMapping("/generate-payslip")
    public ResponseEntity<?> generateDynamicPayslip(
            @RequestParam Long employeeId,
            @RequestParam String month,
            @RequestParam Integer year) {
        try {
            // Get employee details
            Optional<Employee> employeeOpt = employeeRepo.findById(employeeId);
            if (!employeeOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Employee not found"));
            }
            Employee employee = employeeOpt.get();

            // Get current CTC details
            Optional<CTCDetails> ctcOpt = ctcDetailsRepo.findCurrentCTCByEmployeeId(employeeId, LocalDate.now());
            if (!ctcOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "No active CTC found for employee"));
            }
            CTCDetails ctc = ctcOpt.get();

            // Calculate working days for the month
            YearMonth yearMonth = YearMonth.of(year, getMonthNumber(month));
            int totalDaysInMonth = yearMonth.lengthOfMonth();
            int workingDays = calculateWorkingDays(yearMonth);

            // Calculate daily net salary
            BigDecimal monthlyNetSalary = ctc.getNetMonthlySalary();
            BigDecimal dailyNetSalary = monthlyNetSalary.divide(BigDecimal.valueOf(workingDays), 2, RoundingMode.HALF_UP);

            // Get unpaid leaves for the specific month
            List<EmployeeLeave> unpaidLeaves = getUnpaidLeavesForMonth(employeeId, yearMonth);
            int unpaidLeaveDays = calculateUnpaidLeaveDaysInMonth(unpaidLeaves, yearMonth);

            // Calculate final net salary after deducting unpaid leaves
            BigDecimal unpaidLeaveDeduction = dailyNetSalary.multiply(BigDecimal.valueOf(unpaidLeaveDays));
            BigDecimal finalNetSalary = monthlyNetSalary.subtract(unpaidLeaveDeduction);

            // Prepare response
            Map<String, Object> payslipData = new HashMap<>();
            payslipData.put("employee", Map.of(
                    "id", employee.getId(),
                    "name", employee.getFullName(),
                    "email", employee.getEmail(),
                    "position", employee.getPosition()
            ));
            payslipData.put("period", Map.of(
                    "month", month,
                    "year", year
            ));
            payslipData.put("salary", Map.of(
                    "basicSalary", ctc.getBasicSalary(),
                    "hra", ctc.getHra(),
                    "conveyanceAllowance", ctc.getConveyanceAllowance(),
                    "medicalAllowance", ctc.getMedicalAllowance(),
                    "specialAllowance", ctc.getSpecialAllowance(),
                    "performanceBonus", ctc.getPerformanceBonus(),
                    "grossMonthlySalary", ctc.getGrossMonthlySalary(),
                    "monthlyNetSalary", monthlyNetSalary
            ));
            payslipData.put("deductions", Map.of(
                    "employeePf", ctc.getEmployeePf(),
                    "professionalTax", ctc.getProfessionalTax(),
                    "tds", ctc.getTds(),
                    "insurancePremium", ctc.getInsurancePremium(),
                    "totalMonthlyDeductions", ctc.getTotalMonthlyDeductions()
            ));
            payslipData.put("attendance", Map.of(
                    "totalDaysInMonth", totalDaysInMonth,
                    "workingDays", workingDays,
                    "unpaidLeaveDays", unpaidLeaveDays,
                    "effectiveWorkingDays", workingDays - unpaidLeaveDays
            ));
            payslipData.put("calculations", Map.of(
                    "dailyNetSalary", dailyNetSalary,
                    "unpaidLeaveDeduction", unpaidLeaveDeduction,
                    "finalNetSalary", finalNetSalary
            ));

            return ResponseEntity.ok(payslipData);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error generating payslip: " + e.getMessage()));
        }
    }

    // Helper method to get month number from name
    private int getMonthNumber(String monthName) {
        switch (monthName.toLowerCase()) {
            case "january": return 1;
            case "february": return 2;
            case "march": return 3;
            case "april": return 4;
            case "may": return 5;
            case "june": return 6;
            case "july": return 7;
            case "august": return 8;
            case "september": return 9;
            case "october": return 10;
            case "november": return 11;
            case "december": return 12;
            default: throw new IllegalArgumentException("Invalid month name: " + monthName);
        }
    }

    // Calculate working days (excluding weekends)
    private int calculateWorkingDays(YearMonth yearMonth) {
        int workingDays = 0;
        for (int day = 1; day <= yearMonth.lengthOfMonth(); day++) {
            LocalDate date = yearMonth.atDay(day);
            // Monday = 1, Sunday = 7
            if (date.getDayOfWeek().getValue() <= 5) { // Monday to Friday
                workingDays++;
            }
        }
        return workingDays;
    }

    // Get unpaid leaves for a specific month
    private List<EmployeeLeave> getUnpaidLeavesForMonth(Long employeeId, YearMonth yearMonth) {
        return employeeLeaveRepo.findApprovedUnpaidLeavesInMonth(
                employeeId, yearMonth.getYear(), yearMonth.getMonthValue());
    }

    // Calculate unpaid leave days that fall within the specific month
    private int calculateUnpaidLeaveDaysInMonth(List<EmployeeLeave> unpaidLeaves, YearMonth yearMonth) {
        int unpaidDays = 0;
        LocalDate monthStart = yearMonth.atDay(1);
        LocalDate monthEnd = yearMonth.atEndOfMonth();

        for (EmployeeLeave leave : unpaidLeaves) {
            LocalDate leaveStart = leave.getFromDate().isBefore(monthStart) ? monthStart : leave.getFromDate();
            LocalDate leaveEnd = leave.getToDate().isAfter(monthEnd) ? monthEnd : leave.getToDate();
            
            // Count working days in the leave period
            for (LocalDate date = leaveStart; !date.isAfter(leaveEnd); date = date.plusDays(1)) {
                if (date.getDayOfWeek().getValue() <= 5) { // Monday to Friday
                    unpaidDays++;
                }
            }
        }
        return unpaidDays;
    }

}
