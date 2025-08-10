package com.payflowapi.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_resignation")
public class EmployeeResignation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long employeeId;
    private Long managerId; // Manager who needs to approve
    private String employeeName;
    private String employeeEmail;
    private String department;
    private String role;
    private String position;

    @Column(name = "resignation_date")
    private LocalDate resignationDate; // Date when resignation was submitted

    @Column(name = "requested_last_working_day")
    private LocalDate requestedLastWorkingDay; // Employee's preferred last working day

    @Column(name = "approved_last_working_day")
    private LocalDate approvedLastWorkingDay; // Final approved last working day

    @Column(name = "notice_period_days")
    private Integer noticePeriodDays; // Standard notice period in days

    @Column(name = "actual_notice_days")
    private Integer actualNoticeDays; // Actual notice days being served

    @Column(length = 20)
    private String status; // PENDING, APPROVED, REJECTED, WITHDRAWN

    @Column(length = 1000)
    private String reason; // Employee's resignation reason

    @Column(name = "manager_comments", length = 1000)
    private String managerComments; // Manager's approval/rejection comments

    @Column(name = "hr_comments", length = 1000)
    private String hrComments; // HR comments for final processing

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "processed_by")
    private String processedBy; // Manager/HR who processed the request

    @Column(name = "resignation_type")
    private String resignationType; // VOLUNTARY, INVOLUNTARY, RETIREMENT, TERMINATION

    @Column(name = "exit_interview_completed")
    private Boolean exitInterviewCompleted = false;

    @Column(name = "handover_completed")
    private Boolean handoverCompleted = false;

    @Column(name = "assets_returned")
    private Boolean assetsReturned = false;

    // Constructors
    public EmployeeResignation() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public EmployeeResignation(Long employeeId, String employeeName, String employeeEmail,
            String department, String role, String position, Long managerId,
            LocalDate requestedLastWorkingDay, String reason) {
        this();
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.employeeEmail = employeeEmail;
        this.department = department;
        this.role = role;
        this.position = position;
        this.managerId = managerId;
        this.resignationDate = LocalDate.now();
        this.requestedLastWorkingDay = requestedLastWorkingDay;
        this.reason = reason;
        this.status = "PENDING";
        this.resignationType = "VOLUNTARY";

        // Calculate notice period days
        this.noticePeriodDays = calculateNoticePeriod(position);
        this.actualNoticeDays = (int) java.time.temporal.ChronoUnit.DAYS.between(
                this.resignationDate, this.requestedLastWorkingDay);
    }

    private Integer calculateNoticePeriod(String position) {
        // Standard notice periods based on position
        if (position == null)
            return 30;

        switch (position.toUpperCase()) {
            case "SENIOR":
                return 60; // Senior employees: 2 months notice
            case "JUNIOR":
                return 30; // Junior employees: 1 month notice
            default:
                return 30; // Default: 1 month notice
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public Long getManagerId() {
        return managerId;
    }

    public void setManagerId(Long managerId) {
        this.managerId = managerId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getEmployeeEmail() {
        return employeeEmail;
    }

    public void setEmployeeEmail(String employeeEmail) {
        this.employeeEmail = employeeEmail;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public LocalDate getResignationDate() {
        return resignationDate;
    }

    public void setResignationDate(LocalDate resignationDate) {
        this.resignationDate = resignationDate;
    }

    public LocalDate getRequestedLastWorkingDay() {
        return requestedLastWorkingDay;
    }

    public void setRequestedLastWorkingDay(LocalDate requestedLastWorkingDay) {
        this.requestedLastWorkingDay = requestedLastWorkingDay;
        // Recalculate actual notice days when requested date changes
        if (this.resignationDate != null && requestedLastWorkingDay != null) {
            this.actualNoticeDays = (int) java.time.temporal.ChronoUnit.DAYS.between(
                    this.resignationDate, requestedLastWorkingDay);
        }
    }

    public LocalDate getApprovedLastWorkingDay() {
        return approvedLastWorkingDay;
    }

    public void setApprovedLastWorkingDay(LocalDate approvedLastWorkingDay) {
        this.approvedLastWorkingDay = approvedLastWorkingDay;
    }

    public Integer getNoticePeriodDays() {
        return noticePeriodDays;
    }

    public void setNoticePeriodDays(Integer noticePeriodDays) {
        this.noticePeriodDays = noticePeriodDays;
    }

    public Integer getActualNoticeDays() {
        return actualNoticeDays;
    }

    public void setActualNoticeDays(Integer actualNoticeDays) {
        this.actualNoticeDays = actualNoticeDays;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getManagerComments() {
        return managerComments;
    }

    public void setManagerComments(String managerComments) {
        this.managerComments = managerComments;
    }

    public String getHrComments() {
        return hrComments;
    }

    public void setHrComments(String hrComments) {
        this.hrComments = hrComments;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getProcessedBy() {
        return processedBy;
    }

    public void setProcessedBy(String processedBy) {
        this.processedBy = processedBy;
    }

    public String getResignationType() {
        return resignationType;
    }

    public void setResignationType(String resignationType) {
        this.resignationType = resignationType;
    }

    public Boolean getExitInterviewCompleted() {
        return exitInterviewCompleted;
    }

    public void setExitInterviewCompleted(Boolean exitInterviewCompleted) {
        this.exitInterviewCompleted = exitInterviewCompleted;
    }

    public Boolean getHandoverCompleted() {
        return handoverCompleted;
    }

    public void setHandoverCompleted(Boolean handoverCompleted) {
        this.handoverCompleted = handoverCompleted;
    }

    public Boolean getAssetsReturned() {
        return assetsReturned;
    }

    public void setAssetsReturned(Boolean assetsReturned) {
        this.assetsReturned = assetsReturned;
    }
}
