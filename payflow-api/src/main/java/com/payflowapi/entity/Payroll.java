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

    // Payment hold related fields
    private Boolean isOnHold = false;
    private String holdReason;
    private Long holdByUserId; // User ID who placed the hold
    private LocalDate holdDate;
    private String holdByUserRole; // HR, ADMIN, MANAGER
    private Integer holdMonth; // Month of the payment being held
    private Integer holdYear; // Year of the payment being held
    private Integer numberOfLeaves;
    private Double deductionAmount;

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

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Double getNetSalary() {
        return netSalary;
    }

    public void setNetSalary(Double netSalary) {
        this.netSalary = netSalary;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCycle() {
        return cycle;
    }

    public void setCycle(String cycle) {
        this.cycle = cycle;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    public BigDecimal getBaseSalary() {
        return baseSalary;
    }

    public void setBaseSalary(BigDecimal baseSalary) {
        this.baseSalary = baseSalary;
    }

    public Integer getNumberOfLeaves() {
        return numberOfLeaves;
    }

    public void setNumberOfLeaves(Integer numberOfLeaves) {
        this.numberOfLeaves = numberOfLeaves;
    }

    public Double getDeductionAmount() {
        return deductionAmount;
    }

    public void setDeductionAmount(Double deductionAmount) {
        this.deductionAmount = deductionAmount;
    }

    // Payment hold getters and setters
    public Boolean getIsOnHold() {
        return isOnHold;
    }

    public void setIsOnHold(Boolean isOnHold) {
        this.isOnHold = isOnHold;
    }

    public String getHoldReason() {
        return holdReason;
    }

    public void setHoldReason(String holdReason) {
        this.holdReason = holdReason;
    }

    public Long getHoldByUserId() {
        return holdByUserId;
    }

    public void setHoldByUserId(Long holdByUserId) {
        this.holdByUserId = holdByUserId;
    }

    public LocalDate getHoldDate() {
        return holdDate;
    }

    public void setHoldDate(LocalDate holdDate) {
        this.holdDate = holdDate;
    }

    public String getHoldByUserRole() {
        return holdByUserRole;
    }

    public void setHoldByUserRole(String holdByUserRole) {
        this.holdByUserRole = holdByUserRole;
    }

    public Integer getHoldMonth() {
        return holdMonth;
    }

    public void setHoldMonth(Integer holdMonth) {
        this.holdMonth = holdMonth;
    }

    public Integer getHoldYear() {
        return holdYear;
    }

    public void setHoldYear(Integer holdYear) {
        this.holdYear = holdYear;
    }
}