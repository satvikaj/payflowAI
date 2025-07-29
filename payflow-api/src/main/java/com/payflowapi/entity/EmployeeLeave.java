
package com.payflowapi.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.Data;

@Entity
@Table(name = "employee_leave")
@Data
public class EmployeeLeave {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long employeeId;
    private Long managerId; // Manager's user ID
    private String type;
    private LocalDate fromDate;
    private LocalDate toDate;
    private String status;
    private String employeeName;
    private String reason;
    private String denialReason; // Reason provided by manager when denying leave

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getDenialReason() {
        return denialReason;
    }

    public void setDenialReason(String denialReason) {
        this.denialReason = denialReason;
    }
}
