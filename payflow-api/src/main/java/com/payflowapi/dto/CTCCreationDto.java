package com.payflowapi.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CTCCreationDto {
    private Long employeeId;
    private String employeeName;
    private String employeePosition;
    private BigDecimal annualCtc;
    private LocalDate effectiveFrom;
    private String revisionReason;
    private String createdBy;

    // Constructors
    public CTCCreationDto() {}

    public CTCCreationDto(Long employeeId, String employeeName, String employeePosition, 
                          BigDecimal annualCtc, LocalDate effectiveFrom, String revisionReason, String createdBy) {
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.employeePosition = employeePosition;
        this.annualCtc = annualCtc;
        this.effectiveFrom = effectiveFrom;
        this.revisionReason = revisionReason;
        this.createdBy = createdBy;
    }

    // Getters and Setters
    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getEmployeePosition() {
        return employeePosition;
    }

    public void setEmployeePosition(String employeePosition) {
        this.employeePosition = employeePosition;
    }

    public BigDecimal getAnnualCtc() {
        return annualCtc;
    }

    public void setAnnualCtc(BigDecimal annualCtc) {
        this.annualCtc = annualCtc;
    }

    public LocalDate getEffectiveFrom() {
        return effectiveFrom;
    }

    public void setEffectiveFrom(LocalDate effectiveFrom) {
        this.effectiveFrom = effectiveFrom;
    }

    public String getRevisionReason() {
        return revisionReason;
    }

    public void setRevisionReason(String revisionReason) {
        this.revisionReason = revisionReason;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
}
