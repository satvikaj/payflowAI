
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
    private String type;
    private LocalDate fromDate;
    private LocalDate toDate;
    private String status;
    private String employeeName;
}
