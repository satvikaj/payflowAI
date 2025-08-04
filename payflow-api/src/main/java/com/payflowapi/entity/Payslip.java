package com.payflowapi.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payslip")
public class Payslip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payslip_id")
    private Long payslipId;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "month", nullable = false)
    private String month;

    @Column(name = "year", nullable = false)
    private Integer year;

    @Column(name = "basic_salary", precision = 12, scale = 2)
    private BigDecimal basicSalary;

    @Column(name = "hra", precision = 12, scale = 2)
    private BigDecimal hra;

    @Column(name = "allowances", precision = 12, scale = 2)
    private BigDecimal allowances;

    @Column(name = "bonuses", precision = 12, scale = 2)
    private BigDecimal bonuses;

    @Column(name = "gross_salary", precision = 12, scale = 2)
    private BigDecimal grossSalary;

    @Column(name = "pf_deduction", precision = 12, scale = 2)
    private BigDecimal pfDeduction;

    @Column(name = "tax_deduction", precision = 12, scale = 2)
    private BigDecimal taxDeduction;

    @Column(name = "other_deductions", precision = 12, scale = 2)
    private BigDecimal otherDeductions;

    @Column(name = "total_deductions", precision = 12, scale = 2)
    private BigDecimal totalDeductions;

    @Column(name = "net_pay", precision = 12, scale = 2)
    private BigDecimal netPay;

    @Column(name = "working_days")
    private Integer workingDays;

    @Column(name = "present_days")
    private Integer presentDays;

    @Column(name = "leave_days")
    private Integer leaveDays;

    @Column(name = "generated_on")
    private LocalDateTime generatedOn;

    @Column(name = "download_link")
    private String downloadLink;

    @Column(name = "status")
    private String status = "GENERATED"; // GENERATED, SENT, DOWNLOADED

    @Column(name = "generated_by")
    private String generatedBy;

    // Constructors
    public Payslip() {
        this.generatedOn = LocalDateTime.now();
    }

    public Payslip(Long employeeId, String month, Integer year) {
        this();
        this.employeeId = employeeId;
        this.month = month;
        this.year = year;
    }

    // Calculate gross salary
    public void calculateGrossSalary() {
        this.grossSalary = BigDecimal.ZERO;
        if (basicSalary != null)
            this.grossSalary = this.grossSalary.add(basicSalary);
        if (hra != null)
            this.grossSalary = this.grossSalary.add(hra);
        if (allowances != null)
            this.grossSalary = this.grossSalary.add(allowances);
        if (bonuses != null)
            this.grossSalary = this.grossSalary.add(bonuses);
    }

    // Calculate total deductions
    public void calculateTotalDeductions() {
        this.totalDeductions = BigDecimal.ZERO;
        if (pfDeduction != null)
            this.totalDeductions = this.totalDeductions.add(pfDeduction);
        if (taxDeduction != null)
            this.totalDeductions = this.totalDeductions.add(taxDeduction);
        if (otherDeductions != null)
            this.totalDeductions = this.totalDeductions.add(otherDeductions);
    }

    // Calculate net pay
    public void calculateNetPay() {
        this.calculateGrossSalary();
        this.calculateTotalDeductions();
        this.netPay = this.grossSalary.subtract(this.totalDeductions);
    }

    // Getters and Setters
    public Long getPayslipId() {
        return payslipId;
    }

    public void setPayslipId(Long payslipId) {
        this.payslipId = payslipId;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public BigDecimal getBasicSalary() {
        return basicSalary;
    }

    public void setBasicSalary(BigDecimal basicSalary) {
        this.basicSalary = basicSalary;
    }

    public BigDecimal getHra() {
        return hra;
    }

    public void setHra(BigDecimal hra) {
        this.hra = hra;
    }

    public BigDecimal getAllowances() {
        return allowances;
    }

    public void setAllowances(BigDecimal allowances) {
        this.allowances = allowances;
    }

    public BigDecimal getBonuses() {
        return bonuses;
    }

    public void setBonuses(BigDecimal bonuses) {
        this.bonuses = bonuses;
    }

    public BigDecimal getGrossSalary() {
        return grossSalary;
    }

    public void setGrossSalary(BigDecimal grossSalary) {
        this.grossSalary = grossSalary;
    }

    public BigDecimal getPfDeduction() {
        return pfDeduction;
    }

    public void setPfDeduction(BigDecimal pfDeduction) {
        this.pfDeduction = pfDeduction;
    }

    public BigDecimal getTaxDeduction() {
        return taxDeduction;
    }

    public void setTaxDeduction(BigDecimal taxDeduction) {
        this.taxDeduction = taxDeduction;
    }

    public BigDecimal getOtherDeductions() {
        return otherDeductions;
    }

    public void setOtherDeductions(BigDecimal otherDeductions) {
        this.otherDeductions = otherDeductions;
    }

    public BigDecimal getTotalDeductions() {
        return totalDeductions;
    }

    public void setTotalDeductions(BigDecimal totalDeductions) {
        this.totalDeductions = totalDeductions;
    }

    public BigDecimal getNetPay() {
        return netPay;
    }

    public void setNetPay(BigDecimal netPay) {
        this.netPay = netPay;
    }

    public Integer getWorkingDays() {
        return workingDays;
    }

    public void setWorkingDays(Integer workingDays) {
        this.workingDays = workingDays;
    }

    public Integer getPresentDays() {
        return presentDays;
    }

    public void setPresentDays(Integer presentDays) {
        this.presentDays = presentDays;
    }

    public Integer getLeaveDays() {
        return leaveDays;
    }

    public void setLeaveDays(Integer leaveDays) {
        this.leaveDays = leaveDays;
    }

    public LocalDateTime getGeneratedOn() {
        return generatedOn;
    }

    public void setGeneratedOn(LocalDateTime generatedOn) {
        this.generatedOn = generatedOn;
    }

    public String getDownloadLink() {
        return downloadLink;
    }

    public void setDownloadLink(String downloadLink) {
        this.downloadLink = downloadLink;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getGeneratedBy() {
        return generatedBy;
    }

    public void setGeneratedBy(String generatedBy) {
        this.generatedBy = generatedBy;
    }

    @PrePersist
    @PreUpdate
    public void prePersist() {
        this.calculateNetPay();
    }
}
