package com.payflowapi.controller;

import com.payflowapi.dto.PayrollRequest;
import com.payflowapi.entity.Employee;
import com.payflowapi.entity.Payroll;
import com.payflowapi.repository.EmployeeRepository;
import com.payflowapi.repository.PayrollRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payrolls")
@CrossOrigin
public class PayrollController {

    @Autowired
    private PayrollRepository payrollRepo;

    @Autowired
    private EmployeeRepository employeeRepo;

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
        Employee emp = employeeRepo.findById(req.getEmployeeId()).orElseThrow();

        int leaves = 2; // Replace with actual logic
        double deduction = leaves * 1000;
        double finalSalary = req.getBaseSalary() - deduction;

        Payroll payroll = new Payroll();
        payroll.setEmployeeId(emp.getId());
        payroll.setDepartment(req.getDepartment());
        payroll.setBaseSalary(req.getBaseSalary());
        payroll.setNumberOfLeaves(leaves);
        payroll.setDeductionAmount(deduction);
        payroll.setNetSalary(finalSalary);
        payroll.setCycle(req.getCycle());
        payroll.setStatus("Scheduled");
        payroll.setPaymentDate(req.getPaymentDate());

        return payrollRepo.save(payroll);
    }

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
