package com.payflowapi.dto;

public class LeaveStatsDto {
    private int totalPaidLeaves = 12; // Annual paid leaves quota
    private int usedPaidLeaves = 0; // Used paid leaves (in days)
    private int remainingPaidLeaves = 12; // Remaining paid leaves
    private int usedUnpaidLeaves = 0; // Total unpaid leaves taken this year (in days)
    private int unpaidLeavesThisMonth = 0; // Unpaid leaves taken this month (in days)
    private int currentMonth;
    private int currentYear;

    public LeaveStatsDto() {
        java.time.LocalDate now = java.time.LocalDate.now();
        this.currentMonth = now.getMonthValue();
        this.currentYear = now.getYear();
    }

    // Getters and Setters
    public int getTotalPaidLeaves() { return totalPaidLeaves; }
    public void setTotalPaidLeaves(int totalPaidLeaves) { this.totalPaidLeaves = totalPaidLeaves; }

    public int getUsedPaidLeaves() { return usedPaidLeaves; }
    public void setUsedPaidLeaves(int usedPaidLeaves) { this.usedPaidLeaves = usedPaidLeaves; }

    public int getRemainingPaidLeaves() { return remainingPaidLeaves; }
    public void setRemainingPaidLeaves(int remainingPaidLeaves) { this.remainingPaidLeaves = remainingPaidLeaves; }

    public int getUsedUnpaidLeaves() { return usedUnpaidLeaves; }
    public void setUsedUnpaidLeaves(int usedUnpaidLeaves) { this.usedUnpaidLeaves = usedUnpaidLeaves; }

    public int getUnpaidLeavesThisMonth() { return unpaidLeavesThisMonth; }
    public void setUnpaidLeavesThisMonth(int unpaidLeavesThisMonth) { this.unpaidLeavesThisMonth = unpaidLeavesThisMonth; }

    public int getCurrentMonth() { return currentMonth; }
    public void setCurrentMonth(int currentMonth) { this.currentMonth = currentMonth; }

    public int getCurrentYear() { return currentYear; }
    public void setCurrentYear(int currentYear) { this.currentYear = currentYear; }
}
