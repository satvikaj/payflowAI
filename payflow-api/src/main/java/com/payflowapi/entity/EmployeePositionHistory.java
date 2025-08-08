package com.payflowapi.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_position_history")
public class EmployeePositionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long employeeId;
    private String employeeName;
    private String previousDepartment;
    private String newDepartment;
    private String previousRole;
    private String newRole;
    private String previousPosition;
    private String newPosition;
    private LocalDateTime changeDate;
    private String changedBy; // HR user who made the change
    private String reason;

    // Constructors
    public EmployeePositionHistory() {}

    public EmployeePositionHistory(Long employeeId, String employeeName, 
                                 String previousDepartment, String newDepartment,
                                 String previousRole, String newRole,
                                 String previousPosition, String newPosition,
                                 String changedBy, String reason) {
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.previousDepartment = previousDepartment;
        this.newDepartment = newDepartment;
        this.previousRole = previousRole;
        this.newRole = newRole;
        this.previousPosition = previousPosition;
        this.newPosition = newPosition;
        this.changeDate = LocalDateTime.now();
        this.changedBy = changedBy;
        this.reason = reason;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getPreviousDepartment() { return previousDepartment; }
    public void setPreviousDepartment(String previousDepartment) { this.previousDepartment = previousDepartment; }

    public String getNewDepartment() { return newDepartment; }
    public void setNewDepartment(String newDepartment) { this.newDepartment = newDepartment; }

    public String getPreviousRole() { return previousRole; }
    public void setPreviousRole(String previousRole) { this.previousRole = previousRole; }

    public String getNewRole() { return newRole; }
    public void setNewRole(String newRole) { this.newRole = newRole; }

    public String getPreviousPosition() { return previousPosition; }
    public void setPreviousPosition(String previousPosition) { this.previousPosition = previousPosition; }

    public String getNewPosition() { return newPosition; }
    public void setNewPosition(String newPosition) { this.newPosition = newPosition; }

    public LocalDateTime getChangeDate() { return changeDate; }
    public void setChangeDate(LocalDateTime changeDate) { this.changeDate = changeDate; }

    public String getChangedBy() { return changedBy; }
    public void setChangedBy(String changedBy) { this.changedBy = changedBy; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
