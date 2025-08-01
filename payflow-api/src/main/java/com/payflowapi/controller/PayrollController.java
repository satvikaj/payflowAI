package com.payflowapi.controller;

import com.payflowapi.dto.PayrollRequest;
import com.payflowapi.entity.Employee;
import com.payflowapi.entity.EmployeeLeave;
import com.payflowapi.entity.Payroll;
import com.payflowapi.repository.EmployeeLeaveRepository;
import com.payflowapi.repository.EmployeeRepository;
import com.payflowapi.repository.PayrollRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

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

}
