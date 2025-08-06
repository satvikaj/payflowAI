// Payroll.java
package com.payflowapi.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "payroll")
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
    private int numberOfLeaves;
    private double deductionAmount;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Double getNetSalary() { return netSalary; }
    public void setNetSalary(Double netSalary) { this.netSalary = netSalary; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCycle() { return cycle; }
    public void setCycle(String cycle) { this.cycle = cycle; }

    public LocalDate getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDate paymentDate) { this.paymentDate = paymentDate; }

    public BigDecimal getBaseSalary() { return baseSalary; }
    public void setBaseSalary(BigDecimal baseSalary) { this.baseSalary = baseSalary; }

    public int getNumberOfLeaves() { return numberOfLeaves; }
    public void setNumberOfLeaves(int numberOfLeaves) { this.numberOfLeaves = numberOfLeaves; }

    public double getDeductionAmount() { return deductionAmount; }
    public void setDeductionAmount(double deductionAmount) { this.deductionAmount = deductionAmount; }
}