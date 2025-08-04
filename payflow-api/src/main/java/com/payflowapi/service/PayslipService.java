package com.payflowapi.service;

import com.payflowapi.entity.CTCDetails;
import com.payflowapi.entity.Employee;
import com.payflowapi.entity.Payslip;
import com.payflowapi.repository.EmployeeRepository;
import com.payflowapi.repository.PayslipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;

@Service
public class PayslipService {

    @Autowired
    private PayslipRepository payslipRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private CTCService ctcService;

    // Generate payslip for an employee
    public Payslip generatePayslip(Long employeeId, String month, Integer year, String generatedBy) {
        // Check if payslip already exists
        if (payslipRepository.existsByEmployeeIdAndMonthAndYear(employeeId, month, year)) {
            throw new RuntimeException("Payslip already exists for " + month + " " + year);
        }

        // Validate employee exists
        Optional<Employee> employee = employeeRepository.findById(employeeId);
        if (employee.isEmpty()) {
            throw new RuntimeException("Employee not found with ID: " + employeeId);
        }

        // Get current CTC for employee
        Optional<CTCDetails> currentCTC = ctcService.getCurrentCTC(employeeId);
        if (currentCTC.isEmpty()) {
            throw new RuntimeException("No active CTC found for employee ID: " + employeeId);
        }

        CTCDetails ctc = currentCTC.get();
        Payslip payslip = new Payslip(employeeId, month, year);

        // Calculate monthly components from annual CTC
        payslip.setBasicSalary(divideByTwelve(ctc.getBasicSalary()));
        payslip.setHra(divideByTwelve(ctc.getHra()));
        payslip.setAllowances(divideByTwelve(ctc.getAllowances()));
        payslip.setBonuses(divideByTwelve(ctc.getBonuses()));

        // Calculate deductions
        BigDecimal monthlyPF = divideByTwelve(ctc.getPfContribution());
        payslip.setPfDeduction(monthlyPF);

        // Basic tax calculation (this can be enhanced based on tax slabs)
        BigDecimal grossMonthly = payslip.getBasicSalary()
                .add(payslip.getHra())
                .add(payslip.getAllowances())
                .add(payslip.getBonuses());

        BigDecimal taxDeduction = calculateTaxDeduction(grossMonthly);
        payslip.setTaxDeduction(taxDeduction);

        // Set default attendance (can be enhanced to fetch from attendance system)
        payslip.setWorkingDays(22);
        payslip.setPresentDays(22);
        payslip.setLeaveDays(0);

        payslip.setOtherDeductions(BigDecimal.ZERO);
        payslip.setGeneratedBy(generatedBy);
        payslip.setStatus("GENERATED");

        // Calculate final amounts
        payslip.calculateNetPay();

        return payslipRepository.save(payslip);
    }

    // Get all payslips for an employee
    public List<Payslip> getEmployeePayslips(Long employeeId) {
        return payslipRepository.findByEmployeeIdOrderByYearDescMonthDesc(employeeId);
    }

    // Get specific payslip
    public Optional<Payslip> getPayslip(Long employeeId, String month, Integer year) {
        return payslipRepository.findByEmployeeIdAndMonthAndYear(employeeId, month, year);
    }

    // Get payslip by ID
    public Optional<Payslip> getPayslipById(Long payslipId) {
        return payslipRepository.findById(payslipId);
    }

    // Get all payslips for a specific month/year
    public List<Payslip> getPayslipsByMonthYear(String month, Integer year) {
        return payslipRepository.findByMonthAndYearOrderByEmployeeIdAsc(month, year);
    }

    // Update payslip status (e.g., when downloaded)
    public Payslip updatePayslipStatus(Long payslipId, String status) {
        Optional<Payslip> payslip = payslipRepository.findById(payslipId);
        if (payslip.isPresent()) {
            Payslip p = payslip.get();
            p.setStatus(status);
            return payslipRepository.save(p);
        }
        throw new RuntimeException("Payslip not found with ID: " + payslipId);
    }

    // Delete payslip
    public void deletePayslip(Long payslipId) {
        if (payslipRepository.existsById(payslipId)) {
            payslipRepository.deleteById(payslipId);
        } else {
            throw new RuntimeException("Payslip not found with ID: " + payslipId);
        }
    }

    // Get recent payslips for employee
    public List<Payslip> getRecentPayslips(Long employeeId, Integer year) {
        return payslipRepository.findRecentPayslips(employeeId, year);
    }

    // Get all employees with payslips
    public List<Long> getEmployeesWithPayslips() {
        return payslipRepository.findDistinctEmployeeIds();
    }

    // Bulk generate payslips for all employees
    public List<Payslip> generateBulkPayslips(String month, Integer year, String generatedBy) {
        List<Employee> employees = employeeRepository.findAll();
        return employees.stream()
                .filter(emp -> ctcService.hasEmployeeCTC(emp.getId()))
                .filter(emp -> !payslipRepository.existsByEmployeeIdAndMonthAndYear(emp.getId(), month, year))
                .map(emp -> {
                    try {
                        return generatePayslip(emp.getId(), month, year, generatedBy);
                    } catch (Exception e) {
                        System.err.println(
                                "Failed to generate payslip for employee " + emp.getId() + ": " + e.getMessage());
                        return null;
                    }
                })
                .filter(payslip -> payslip != null)
                .toList();
    }

    // Helper method to divide annual amount by 12
    private BigDecimal divideByTwelve(BigDecimal annual) {
        if (annual == null) {
            return BigDecimal.ZERO;
        }
        return annual.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
    }

    // Basic tax calculation (can be enhanced)
    private BigDecimal calculateTaxDeduction(BigDecimal grossMonthly) {
        // Simple tax calculation - can be enhanced based on actual tax slabs
        BigDecimal annualGross = grossMonthly.multiply(BigDecimal.valueOf(12));
        BigDecimal taxableAmount = annualGross.subtract(BigDecimal.valueOf(250000)); // Standard deduction

        if (taxableAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        // Simple 10% tax rate (this should be based on actual tax slabs)
        BigDecimal annualTax = taxableAmount.multiply(BigDecimal.valueOf(0.1));
        return annualTax.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
    }

    // Get all payslips
    public List<Payslip> getAllPayslips() {
        return payslipRepository.findAll();
    }
}
