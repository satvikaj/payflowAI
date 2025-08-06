package com.payflowapi.service;

import com.payflowapi.dto.LeaveStatsDto;
import com.payflowapi.entity.EmployeeLeave;
import com.payflowapi.repository.EmployeeLeaveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class LeaveService {

    @Autowired
    private EmployeeLeaveRepository employeeLeaveRepository;

    /**
     * Calculate the number of days between two dates (inclusive)
     */
    public int calculateLeaveDays(LocalDate fromDate, LocalDate toDate) {
        return (int) ChronoUnit.DAYS.between(fromDate, toDate) + 1;
    }

    /**
     * Get comprehensive leave statistics for an employee
     */
    public LeaveStatsDto getLeaveStats(Long employeeId) {
        LeaveStatsDto stats = new LeaveStatsDto();
        int currentYear = LocalDate.now().getYear();
        int currentMonth = LocalDate.now().getMonthValue();

        // Calculate used paid leaves for current year
        List<EmployeeLeave> paidLeaves = employeeLeaveRepository.findApprovedPaidLeavesInYear(employeeId, currentYear);
        int usedPaidDays = 0;
        for (EmployeeLeave leave : paidLeaves) {
            if (leave.getLeaveDays() != null) {
                usedPaidDays += leave.getLeaveDays();
            } else if (leave.getFromDate() != null && leave.getToDate() != null) {
                usedPaidDays += calculateLeaveDays(leave.getFromDate(), leave.getToDate());
            }
        }

        // Calculate used unpaid leaves for current year
        List<EmployeeLeave> unpaidLeaves = employeeLeaveRepository.findApprovedUnpaidLeavesInYear(employeeId, currentYear);
        int usedUnpaidDays = 0;
        for (EmployeeLeave leave : unpaidLeaves) {
            if (leave.getLeaveDays() != null) {
                usedUnpaidDays += leave.getLeaveDays();
            } else if (leave.getFromDate() != null && leave.getToDate() != null) {
                usedUnpaidDays += calculateLeaveDays(leave.getFromDate(), leave.getToDate());
            }
        }

        // Calculate unpaid leaves for current month
        List<EmployeeLeave> unpaidLeavesThisMonth = employeeLeaveRepository.findApprovedUnpaidLeavesInMonth(employeeId, currentYear, currentMonth);
        int unpaidDaysThisMonth = 0;
        for (EmployeeLeave leave : unpaidLeavesThisMonth) {
            if (leave.getLeaveDays() != null) {
                unpaidDaysThisMonth += leave.getLeaveDays();
            } else if (leave.getFromDate() != null && leave.getToDate() != null) {
                unpaidDaysThisMonth += calculateLeaveDays(leave.getFromDate(), leave.getToDate());
            }
        }

        stats.setUsedPaidLeaves(usedPaidDays);
        stats.setRemainingPaidLeaves(Math.max(0, 12 - usedPaidDays));
        stats.setUsedUnpaidLeaves(usedUnpaidDays);
        stats.setUnpaidLeavesThisMonth(unpaidDaysThisMonth);

        return stats;
    }

    /**
     * Check if requested leave should be paid or unpaid
     */
    public boolean shouldBePaidLeave(Long employeeId, int requestedDays) {
        LeaveStatsDto stats = getLeaveStats(employeeId);
        return stats.getRemainingPaidLeaves() >= requestedDays;
    }

    /**
     * Update leave days for an existing leave record
     */
    public void updateLeaveDays(EmployeeLeave leave) {
        if (leave.getFromDate() != null && leave.getToDate() != null) {
            int days = calculateLeaveDays(leave.getFromDate(), leave.getToDate());
            leave.setLeaveDays(days);
            employeeLeaveRepository.save(leave);
        }
    }
}
