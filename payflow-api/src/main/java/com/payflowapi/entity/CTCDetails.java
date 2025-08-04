package com.payflowapi.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ctc_details")
public class CTCDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ctc_id")
    private Long ctcId;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "basic_salary", precision = 12, scale = 2)
    private BigDecimal basicSalary;

    @Column(name = "hra", precision = 12, scale = 2)
    private BigDecimal hra;

    @Column(name = "allowances", precision = 12, scale = 2)
    private BigDecimal allowances;

    @Column(name = "bonuses", precision = 12, scale = 2)
    private BigDecimal bonuses;

    @Column(name = "pf_contribution", precision = 12, scale = 2)
    private BigDecimal pfContribution;

    @Column(name = "gratuity", precision = 12, scale = 2)
    private BigDecimal gratuity;

    @Column(name = "total_ctc", precision = 12, scale = 2)
    private BigDecimal totalCtc;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "revision_reason")
    private String revisionReason;

    @Column(name = "status")
    private String status = "ACTIVE"; // ACTIVE, INACTIVE

    // Constructors
    public CTCDetails() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Calculate total CTC automatically
    public void calculateTotalCtc() {
        this.totalCtc = BigDecimal.ZERO;
        if (basicSalary != null)
            this.totalCtc = this.totalCtc.add(basicSalary);
        if (hra != null)
            this.totalCtc = this.totalCtc.add(hra);
        if (allowances != null)
            this.totalCtc = this.totalCtc.add(allowances);
        if (bonuses != null)
            this.totalCtc = this.totalCtc.add(bonuses);
        if (pfContribution != null)
            this.totalCtc = this.totalCtc.add(pfContribution);
        if (gratuity != null)
            this.totalCtc = this.totalCtc.add(gratuity);
    }

    // Getters and Setters
    public Long getCtcId() {
        return ctcId;
    }

    public void setCtcId(Long ctcId) {
        this.ctcId = ctcId;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public LocalDate getEffectiveFrom() {
        return effectiveFrom;
    }

    public void setEffectiveFrom(LocalDate effectiveFrom) {
        this.effectiveFrom = effectiveFrom;
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

    public BigDecimal getPfContribution() {
        return pfContribution;
    }

    public void setPfContribution(BigDecimal pfContribution) {
        this.pfContribution = pfContribution;
    }

    public BigDecimal getGratuity() {
        return gratuity;
    }

    public void setGratuity(BigDecimal gratuity) {
        this.gratuity = gratuity;
    }

    public BigDecimal getTotalCtc() {
        return totalCtc;
    }

    public void setTotalCtc(BigDecimal totalCtc) {
        this.totalCtc = totalCtc;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
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

    public String getRevisionReason() {
        return revisionReason;
    }

    public void setRevisionReason(String revisionReason) {
        this.revisionReason = revisionReason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @PrePersist
    @PreUpdate
    public void prePersist() {
        this.updatedAt = LocalDateTime.now();
        this.calculateTotalCtc();
    }
}
