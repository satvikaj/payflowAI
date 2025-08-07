package com.payflowapi.service;

import com.payflowapi.entity.Employee;
import com.payflowapi.entity.Payslip;
import com.payflowapi.repository.EmployeeRepository;
import com.payflowapi.repository.PayslipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
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

    @Autowired
    private PayslipCalculationService payslipCalculationService;

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

        try {
            // Use PayslipCalculationService for consistent calculations
            String[] monthNames = {"January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"};
            int monthIndex = -1;
            for (int i = 0; i < monthNames.length; i++) {
                if (monthNames[i].equalsIgnoreCase(month)) {
                    monthIndex = i + 1;
                    break;
                }
            }
            
            if (monthIndex == -1) {
                throw new RuntimeException("Invalid month name: " + month);
            }

            // Calculate payslip using the same service used for preview
            var calculatedPayslip = payslipCalculationService.calculateMonthlyPayslip(employeeId, year, monthIndex);
            
            // Create Payslip entity from calculated data
            Payslip payslip = new Payslip(employeeId, month, year);
            
            // Map calculated values to payslip entity with null safety
            payslip.setBasicSalary(safeGetBigDecimal(calculatedPayslip, "basicSalary"));
            payslip.setHra(safeGetBigDecimal(calculatedPayslip, "hra"));
            
            // Set allowances (conveyance + medical + other allowances)
            BigDecimal conveyance = safeGetBigDecimal(calculatedPayslip, "conveyanceAllowance");
            BigDecimal medical = safeGetBigDecimal(calculatedPayslip, "medicalAllowance");
            BigDecimal otherAllowances = safeGetBigDecimal(calculatedPayslip, "otherAllowances");
            payslip.setAllowances(conveyance.add(medical).add(otherAllowances));
            
            payslip.setBonuses(safeGetBigDecimal(calculatedPayslip, "performanceBonus"));
            payslip.setPfDeduction(safeGetBigDecimal(calculatedPayslip, "providentFund"));
            payslip.setTaxDeduction(safeGetBigDecimal(calculatedPayslip, "incomeTax"));
            
            // Set attendance data
            payslip.setWorkingDays(safeGetInteger(calculatedPayslip, "totalWorkingDays"));
            payslip.setPresentDays(safeGetInteger(calculatedPayslip, "effectiveWorkingDays"));
            payslip.setLeaveDays(safeGetInteger(calculatedPayslip, "unpaidLeaveDays"));
            
            payslip.setOtherDeductions(safeGetBigDecimal(calculatedPayslip, "professionalTax"));
            payslip.setGeneratedBy(generatedBy);
            payslip.setStatus("GENERATED");

            // Calculate gross salary from individual components
            BigDecimal grossSalary = payslip.getBasicSalary()
                    .add(payslip.getHra())
                    .add(payslip.getAllowances())
                    .add(payslip.getBonuses());
            
            // Calculate total deductions from individual deduction components
            BigDecimal totalDeductions = payslip.getPfDeduction()
                    .add(payslip.getTaxDeduction())
                    .add(payslip.getOtherDeductions())
                    .add(safeGetBigDecimal(calculatedPayslip, "unpaidLeaveDeduction"));
            
            // Set the final calculated values
            payslip.setGrossSalary(grossSalary);
            payslip.setTotalDeductions(totalDeductions);
            payslip.setNetPay(safeGetBigDecimal(calculatedPayslip, "finalNetSalary"));

            return payslipRepository.save(payslip);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate payslip: " + e.getMessage(), e);
        }
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

    // Get all payslips
    public List<Payslip> getAllPayslips() {
        return payslipRepository.findAll();
    }

    // Helper methods for safe value extraction
    private BigDecimal safeGetBigDecimal(java.util.Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) {
            return BigDecimal.ZERO;
        }
        if (value instanceof BigDecimal) {
            return (BigDecimal) value;
        }
        if (value instanceof Number) {
            return new BigDecimal(value.toString());
        }
        try {
            return new BigDecimal(value.toString());
        } catch (NumberFormatException e) {
            return BigDecimal.ZERO;
        }
    }

    private int safeGetInteger(java.util.Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) {
            return 0;
        }
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        try {
            return Integer.parseInt(value.toString());
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
