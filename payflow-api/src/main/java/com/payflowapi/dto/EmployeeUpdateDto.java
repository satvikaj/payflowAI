package com.payflowapi.dto;

public class EmployeeUpdateDto {
    private Long employeeId;
    private String department;
    private String role;
    private String position;
    private String reason;
    private String changedBy;

    // Constructors
    public EmployeeUpdateDto() {}

    public EmployeeUpdateDto(Long employeeId, String department, String role, String position, String reason, String changedBy) {
        this.employeeId = employeeId;
        this.department = department;
        this.role = role;
        this.position = position;
        this.reason = reason;
        this.changedBy = changedBy;
    }

    // Getters and Setters
    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getChangedBy() { return changedBy; }
    public void setChangedBy(String changedBy) { this.changedBy = changedBy; }
}
