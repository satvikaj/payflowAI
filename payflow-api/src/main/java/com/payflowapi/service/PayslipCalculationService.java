package com.payflowapi.service;

import com.payflowapi.entity.EmployeeLeave;
import com.payflowapi.entity.CTCDetails;
import com.payflowapi.repository.EmployeeLeaveRepository;
import com.payflowapi.repository.CTCDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class PayslipCalculationService {

    @Autowired
    private EmployeeLeaveRepository employeeLeaveRepository;
    
    @Autowired
    private CTCDetailsRepository ctcDetailsRepository;

    /**
     * Calculate total working days in a month (excluding Sundays)
     */
    public int calculateWorkingDaysInMonth(int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        int totalDays = yearMonth.lengthOfMonth();
        int workingDays = 0;
        
        for (int day = 1; day <= totalDays; day++) {
            LocalDate date = LocalDate.of(year, month, day);
            // Exclude Sundays (day of week = 7)
            if (date.getDayOfWeek().getValue() != 7) {
                workingDays++;
            }
        }
        
        return workingDays;
    }

    /**
     * Calculate unpaid leave days for an employee in a specific month
     */
    public int calculateUnpaidLeaveDaysInMonth(Long employeeId, int year, int month) {
        LocalDate monthStart = LocalDate.of(year, month, 1);
        LocalDate monthEnd = monthStart.withDayOfMonth(monthStart.lengthOfMonth());
        
        List<EmployeeLeave> unpaidLeaves = employeeLeaveRepository
            .findByEmployeeIdAndStatusAndIsPaidAndDateRange(
                employeeId, "APPROVED", false, monthStart, monthEnd);
        
        int unpaidDays = 0;
        
        for (EmployeeLeave leave : unpaidLeaves) {
            LocalDate leaveStart = leave.getFromDate().isBefore(monthStart) ? monthStart : leave.getFromDate();
            LocalDate leaveEnd = leave.getToDate().isAfter(monthEnd) ? monthEnd : leave.getToDate();
            
            // Count working days (excluding Sundays) in the leave period
            LocalDate current = leaveStart;
            while (!current.isAfter(leaveEnd)) {
                if (current.getDayOfWeek().getValue() != 7) { // Not Sunday
                    unpaidDays++;
                }
                current = current.plusDays(1);
            }
        }
        
        return unpaidDays;
    }

    /**
     * Calculate payslip for an employee for a specific month
     */
    public Map<String, Object> calculateMonthlyPayslip(Long employeeId, int year, int month) {
        Map<String, Object> payslip = new HashMap<>();
        
        // Get employee's latest CTC details
        CTCDetails ctcDetails = ctcDetailsRepository.findTopByEmployeeIdOrderByEffectiveFromDesc(employeeId)
            .orElseThrow(() -> new RuntimeException("No CTC details found for employee ID: " + employeeId));
        
        // Calculate working days and unpaid leave
        int totalWorkingDays = calculateWorkingDaysInMonth(year, month);
        int unpaidLeaveDays = calculateUnpaidLeaveDaysInMonth(employeeId, year, month);
        int effectiveWorkingDays = totalWorkingDays - unpaidLeaveDays;
        
        // Get monthly net salary from CTC
        BigDecimal monthlyNetSalary = ctcDetails.getNetSalary();
        
        // Calculate daily rate
        BigDecimal dailyRate = monthlyNetSalary.divide(
            BigDecimal.valueOf(totalWorkingDays), 2, RoundingMode.HALF_UP);
        
        // Calculate deduction for unpaid leave
        BigDecimal unpaidLeaveDeduction = dailyRate.multiply(BigDecimal.valueOf(unpaidLeaveDays));
        
        // Calculate final payable amount
        BigDecimal finalNetSalary = monthlyNetSalary.subtract(unpaidLeaveDeduction);
        
        // Build payslip data
        payslip.put("employeeId", employeeId);
        payslip.put("employeeName", ctcDetails.getEmployeeName());
        payslip.put("employeePosition", ctcDetails.getEmployeePosition());
        payslip.put("year", year);
        payslip.put("month", month);
        payslip.put("totalWorkingDays", totalWorkingDays);
        payslip.put("unpaidLeaveDays", unpaidLeaveDays);
        payslip.put("effectiveWorkingDays", effectiveWorkingDays);
        payslip.put("monthlyNetSalary", monthlyNetSalary);
        payslip.put("dailyRate", dailyRate);
        payslip.put("unpaidLeaveDeduction", unpaidLeaveDeduction);
        payslip.put("finalNetSalary", finalNetSalary);
        
        // Include CTC breakdown
        payslip.put("basicSalary", ctcDetails.getBasicSalary());
        payslip.put("hra", ctcDetails.getHra());
        payslip.put("conveyanceAllowance", ctcDetails.getConveyanceAllowance());
        payslip.put("medicalAllowance", ctcDetails.getMedicalAllowance());
        payslip.put("specialAllowance", ctcDetails.getSpecialAllowance());
        payslip.put("performanceBonus", ctcDetails.getPerformanceBonus());
        payslip.put("providentFund", ctcDetails.getProvidentFund());
        payslip.put("professionalTax", ctcDetails.getProfessionalTax());
        payslip.put("incomeTax", ctcDetails.getIncomeTax());
        payslip.put("insurancePremium", ctcDetails.getInsurancePremium());
        
        return payslip;
    }
}
