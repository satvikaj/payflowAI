// Payroll.java
package com.payflowapi.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
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
    private BigDecimal baseSalary;
//    private BigDecimal netSalary;
//    private BigDecimal deductionAmount;

    //    private Double baseSalary;
//    private Integer numberOfLeaves;
//    private Double deductionAmount;
    private int numberOfLeaves;

    public int getNumberOfLeaves() {
        return numberOfLeaves;
    }

    public void setNumberOfLeaves(int numberOfLeaves) {
        this.numberOfLeaves = numberOfLeaves;
    }
    private double deductionAmount;

    public double getDeductionAmount() {
        return deductionAmount;
    }

    public void setDeductionAmount(double deductionAmount) {
        this.deductionAmount = deductionAmount;
    }

    public Long getEmployeeId() {
        return employeeId;
    }


}