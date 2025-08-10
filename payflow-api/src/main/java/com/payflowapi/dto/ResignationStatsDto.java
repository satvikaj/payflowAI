package com.payflowapi.dto;

import java.time.LocalDate;

public class ResignationStatsDto {
    private Long totalResignations;
    private Long pendingResignations;
    private Long approvedResignations;
    private Long rejectedResignations;
    private Long withdrawnResignations;

    private Long resignationsThisMonth;
    private Long resignationsLastMonth;
    private Long resignationsThisYear;

    private Long overdueResignations; // Pending for more than X days
    private Long exitInterviewsPending;
    private Long handoversPending;
    private Long assetsNotReturned;

    private Double averageNoticePeriod;
    private String topResignationReason;
    private String mostAffectedDepartment;

    private LocalDate oldestPendingDate;
    private LocalDate nearestLastWorkingDay;

    // Constructors
    public ResignationStatsDto() {
    }

    public ResignationStatsDto(Long totalResignations, Long pendingResignations,
            Long approvedResignations, Long rejectedResignations) {
        this.totalResignations = totalResignations;
        this.pendingResignations = pendingResignations;
        this.approvedResignations = approvedResignations;
        this.rejectedResignations = rejectedResignations;
    }

    // Getters and Setters
    public Long getTotalResignations() {
        return totalResignations;
    }

    public void setTotalResignations(Long totalResignations) {
        this.totalResignations = totalResignations;
    }

    public Long getPendingResignations() {
        return pendingResignations;
    }

    public void setPendingResignations(Long pendingResignations) {
        this.pendingResignations = pendingResignations;
    }

    public Long getApprovedResignations() {
        return approvedResignations;
    }

    public void setApprovedResignations(Long approvedResignations) {
        this.approvedResignations = approvedResignations;
    }

    public Long getRejectedResignations() {
        return rejectedResignations;
    }

    public void setRejectedResignations(Long rejectedResignations) {
        this.rejectedResignations = rejectedResignations;
    }

    public Long getWithdrawnResignations() {
        return withdrawnResignations;
    }

    public void setWithdrawnResignations(Long withdrawnResignations) {
        this.withdrawnResignations = withdrawnResignations;
    }

    public Long getResignationsThisMonth() {
        return resignationsThisMonth;
    }

    public void setResignationsThisMonth(Long resignationsThisMonth) {
        this.resignationsThisMonth = resignationsThisMonth;
    }

    public Long getResignationsLastMonth() {
        return resignationsLastMonth;
    }

    public void setResignationsLastMonth(Long resignationsLastMonth) {
        this.resignationsLastMonth = resignationsLastMonth;
    }

    public Long getResignationsThisYear() {
        return resignationsThisYear;
    }

    public void setResignationsThisYear(Long resignationsThisYear) {
        this.resignationsThisYear = resignationsThisYear;
    }

    public Long getOverdueResignations() {
        return overdueResignations;
    }

    public void setOverdueResignations(Long overdueResignations) {
        this.overdueResignations = overdueResignations;
    }

    public Long getExitInterviewsPending() {
        return exitInterviewsPending;
    }

    public void setExitInterviewsPending(Long exitInterviewsPending) {
        this.exitInterviewsPending = exitInterviewsPending;
    }

    public Long getHandoversPending() {
        return handoversPending;
    }

    public void setHandoversPending(Long handoversPending) {
        this.handoversPending = handoversPending;
    }

    public Long getAssetsNotReturned() {
        return assetsNotReturned;
    }

    public void setAssetsNotReturned(Long assetsNotReturned) {
        this.assetsNotReturned = assetsNotReturned;
    }

    public Double getAverageNoticePeriod() {
        return averageNoticePeriod;
    }

    public void setAverageNoticePeriod(Double averageNoticePeriod) {
        this.averageNoticePeriod = averageNoticePeriod;
    }

    public String getTopResignationReason() {
        return topResignationReason;
    }

    public void setTopResignationReason(String topResignationReason) {
        this.topResignationReason = topResignationReason;
    }

    public String getMostAffectedDepartment() {
        return mostAffectedDepartment;
    }

    public void setMostAffectedDepartment(String mostAffectedDepartment) {
        this.mostAffectedDepartment = mostAffectedDepartment;
    }

    public LocalDate getOldestPendingDate() {
        return oldestPendingDate;
    }

    public void setOldestPendingDate(LocalDate oldestPendingDate) {
        this.oldestPendingDate = oldestPendingDate;
    }

    public LocalDate getNearestLastWorkingDay() {
        return nearestLastWorkingDay;
    }

    public void setNearestLastWorkingDay(LocalDate nearestLastWorkingDay) {
        this.nearestLastWorkingDay = nearestLastWorkingDay;
    }
}
