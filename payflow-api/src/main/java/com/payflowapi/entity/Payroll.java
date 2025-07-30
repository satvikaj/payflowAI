// Payroll.java
package com.payflowapi.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.Data;

@Entity
@Table(name = "payroll")
@Data
public class Payroll {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long employeeId;
    private String department;
    private Double netSalary;
    private String status;
    private String cycle;
    private LocalDate paymentDate;

    // Added fields for leave-based deduction calculation
    private Double baseSalary;
    private Integer numberOfLeaves;
    private Double deductionAmount;
}