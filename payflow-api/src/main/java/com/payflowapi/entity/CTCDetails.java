package com.payflowapi.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
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

    @Column(name = "employee_name")
    private String employeeName;

    @Column(name = "employee_position")
    private String employeePosition;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "annual_ctc", precision = 12, scale = 2, nullable = false)
    private BigDecimal annualCtc;

    // Earnings Components (Auto-calculated from Annual CTC)
    @Column(name = "basic_salary", precision = 12, scale = 2)
    private BigDecimal basicSalary;

    @Column(name = "hra", precision = 12, scale = 2)
    private BigDecimal hra;

    @Column(name = "conveyance_allowance", precision = 12, scale = 2)
    private BigDecimal conveyanceAllowance;

    @Column(name = "medical_allowance", precision = 12, scale = 2)
    private BigDecimal medicalAllowance;

    @Column(name = "special_allowance", precision = 12, scale = 2)
    private BigDecimal specialAllowance;

    @Column(name = "performance_bonus", precision = 12, scale = 2)
    private BigDecimal performanceBonus;

    @Column(name = "employer_pf_contribution", precision = 12, scale = 2)
    private BigDecimal employerPfContribution;

    @Column(name = "gratuity", precision = 12, scale = 2)
    private BigDecimal gratuity;

    @Column(name = "other_benefits", precision = 12, scale = 2)
    private BigDecimal otherBenefits;

    // Monthly Deductions
    @Column(name = "employee_pf", precision = 12, scale = 2)
    private BigDecimal employeePf;

    @Column(name = "provident_fund", precision = 12, scale = 2)
    private BigDecimal providentFund;

    @Column(name = "professional_tax", precision = 12, scale = 2)
    private BigDecimal professionalTax;

    @Column(name = "tds", precision = 12, scale = 2)
    private BigDecimal tds;

    @Column(name = "insurance_premium", precision = 12, scale = 2)
    private BigDecimal insurancePremium;

    @Column(name = "other_deductions", precision = 12, scale = 2)
    private BigDecimal otherDeductions;

    @Column(name = "income_tax", precision = 12, scale = 2)
    private BigDecimal incomeTax;

    // Calculated Fields
    @Column(name = "gross_monthly_salary", precision = 12, scale = 2)
    private BigDecimal grossMonthlySalary;

    @Column(name = "gross_salary", precision = 12, scale = 2)
    private BigDecimal grossSalary;

    @Column(name = "total_monthly_deductions", precision = 12, scale = 2)
    private BigDecimal totalMonthlyDeductions;

    @Column(name = "net_monthly_salary", precision = 12, scale = 2)
    private BigDecimal netMonthlySalary;

    @Column(name = "net_salary", precision = 12, scale = 2)
    private BigDecimal netSalary;

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

    // Auto-calculate all CTC components based on Annual CTC
    public void calculateCTCStructure() {
        if (annualCtc == null || annualCtc.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        // Standard CTC breakdown percentages
        // Basic Salary: 40% of Annual CTC
        this.basicSalary = annualCtc.multiply(new BigDecimal("0.40")).setScale(2, RoundingMode.HALF_UP);
        
        // HRA: 50% of Basic Salary
        this.hra = basicSalary.multiply(new BigDecimal("0.50")).setScale(2, RoundingMode.HALF_UP);
        
        // Conveyance Allowance: Fixed amount (1600 per month * 12)
        this.conveyanceAllowance = new BigDecimal("19200");
        
        // Medical Allowance: Fixed amount (1250 per month * 12)
        this.medicalAllowance = new BigDecimal("15000");
        
        // Performance Bonus: 10% of Annual CTC
        this.performanceBonus = annualCtc.multiply(new BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP);
        
        // Employer PF Contribution: 12% of Basic Salary
        this.employerPfContribution = basicSalary.multiply(new BigDecimal("0.12")).setScale(2, RoundingMode.HALF_UP);
        
        // Gratuity: 4.81% of Basic Salary
        this.gratuity = basicSalary.multiply(new BigDecimal("0.0481")).setScale(2, RoundingMode.HALF_UP);
        
        // Other Benefits: Fixed ₹25,000/year - insurance, LTA etc.
        this.otherBenefits = new BigDecimal("25000");
        
        // Special Allowance: Remaining amount to reach Annual CTC
        BigDecimal totalCalculated = basicSalary.add(hra).add(conveyanceAllowance)
                .add(medicalAllowance).add(performanceBonus)
                .add(employerPfContribution).add(gratuity).add(otherBenefits);
        
        this.specialAllowance = annualCtc.subtract(totalCalculated).setScale(2, RoundingMode.HALF_UP);
        
        // Calculate Monthly Deductions
        // Employee PF: 12% of Basic Salary (monthly)
        this.employeePf = basicSalary.multiply(new BigDecimal("0.12")).divide(new BigDecimal("12"), 2, RoundingMode.HALF_UP);
        
        // Provident Fund: Same as Employee PF for database compatibility
        this.providentFund = this.employeePf;
        
        // Professional Tax: Fixed (200 per month for most states)
        this.professionalTax = new BigDecimal("200");
        
        // TDS: Estimated based on salary (simplified calculation)
        BigDecimal monthlyGross = annualCtc.divide(new BigDecimal("12"), 2, RoundingMode.HALF_UP);
        if (monthlyGross.compareTo(new BigDecimal("50000")) > 0) {
            this.tds = monthlyGross.multiply(new BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP);
        } else if (monthlyGross.compareTo(new BigDecimal("25000")) > 0) {
            this.tds = monthlyGross.multiply(new BigDecimal("0.05")).setScale(2, RoundingMode.HALF_UP);
        } else {
            this.tds = BigDecimal.ZERO;
        }
        
        // Insurance Premium: 1% of monthly gross (if applicable)
        this.insurancePremium = monthlyGross.multiply(new BigDecimal("0.01")).setScale(2, RoundingMode.HALF_UP);
        
        // Other Deductions: Default to 0
        if (this.otherDeductions == null) {
            this.otherDeductions = BigDecimal.ZERO;
        }
        
        // Income Tax: Default to 0 (will be calculated based on actual tax brackets)
        if (this.incomeTax == null) {
            this.incomeTax = BigDecimal.ZERO;
        }
        
        // Calculate Monthly Salary Components
        this.grossMonthlySalary = (basicSalary.add(hra).add(conveyanceAllowance).add(medicalAllowance).add(specialAllowance).add(performanceBonus).add(otherBenefits))
                .divide(new BigDecimal("12"), 2, RoundingMode.HALF_UP);
        
        // Set grossSalary same as grossMonthlySalary for database compatibility
        this.grossSalary = this.grossMonthlySalary;
        
        this.totalMonthlyDeductions = employeePf.add(professionalTax).add(tds)
                .add(insurancePremium).add(otherDeductions).add(incomeTax);
        
        this.netMonthlySalary = grossMonthlySalary.subtract(totalMonthlyDeductions);
        
        // Set netSalary same as netMonthlySalary for database compatibility
        this.netSalary = this.netMonthlySalary;
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

    public BigDecimal getAnnualCtc() {
        return annualCtc;
    }

    public void setAnnualCtc(BigDecimal annualCtc) {
        this.annualCtc = annualCtc;
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

    public BigDecimal getConveyanceAllowance() {
        return conveyanceAllowance;
    }

    public void setConveyanceAllowance(BigDecimal conveyanceAllowance) {
        this.conveyanceAllowance = conveyanceAllowance;
    }

    public BigDecimal getMedicalAllowance() {
        return medicalAllowance;
    }

    public void setMedicalAllowance(BigDecimal medicalAllowance) {
        this.medicalAllowance = medicalAllowance;
    }

    public BigDecimal getSpecialAllowance() {
        return specialAllowance;
    }

    public void setSpecialAllowance(BigDecimal specialAllowance) {
        this.specialAllowance = specialAllowance;
    }

    public BigDecimal getPerformanceBonus() {
        return performanceBonus;
    }

    public void setPerformanceBonus(BigDecimal performanceBonus) {
        this.performanceBonus = performanceBonus;
    }

    public BigDecimal getEmployerPfContribution() {
        return employerPfContribution;
    }

    public void setEmployerPfContribution(BigDecimal employerPfContribution) {
        this.employerPfContribution = employerPfContribution;
    }

    public BigDecimal getGratuity() {
        return gratuity;
    }

    public void setGratuity(BigDecimal gratuity) {
        this.gratuity = gratuity;
    }

    public BigDecimal getOtherBenefits() {
        return otherBenefits;
    }

    public void setOtherBenefits(BigDecimal otherBenefits) {
        this.otherBenefits = otherBenefits;
    }

    public BigDecimal getEmployeePf() {
        return employeePf;
    }

    public void setEmployeePf(BigDecimal employeePf) {
        this.employeePf = employeePf;
    }

    public BigDecimal getProvidentFund() {
        return providentFund;
    }

    public void setProvidentFund(BigDecimal providentFund) {
        this.providentFund = providentFund;
    }

    public BigDecimal getProfessionalTax() {
        return professionalTax;
    }

    public void setProfessionalTax(BigDecimal professionalTax) {
        this.professionalTax = professionalTax;
    }

    public BigDecimal getTds() {
        return tds;
    }

    public void setTds(BigDecimal tds) {
        this.tds = tds;
    }

    public BigDecimal getInsurancePremium() {
        return insurancePremium;
    }

    public void setInsurancePremium(BigDecimal insurancePremium) {
        this.insurancePremium = insurancePremium;
    }

    public BigDecimal getOtherDeductions() {
        return otherDeductions;
    }

    public void setOtherDeductions(BigDecimal otherDeductions) {
        this.otherDeductions = otherDeductions;
    }

    public BigDecimal getIncomeTax() {
        return incomeTax;
    }

    public void setIncomeTax(BigDecimal incomeTax) {
        this.incomeTax = incomeTax;
    }

    public BigDecimal getGrossMonthlySalary() {
        return grossMonthlySalary;
    }

    public void setGrossMonthlySalary(BigDecimal grossMonthlySalary) {
        this.grossMonthlySalary = grossMonthlySalary;
    }

    public BigDecimal getGrossSalary() {
        return grossSalary;
    }

    public void setGrossSalary(BigDecimal grossSalary) {
        this.grossSalary = grossSalary;
    }

    public BigDecimal getTotalMonthlyDeductions() {
        return totalMonthlyDeductions;
    }

    public void setTotalMonthlyDeductions(BigDecimal totalMonthlyDeductions) {
        this.totalMonthlyDeductions = totalMonthlyDeductions;
    }

    public BigDecimal getNetMonthlySalary() {
        return netMonthlySalary;
    }

    public void setNetMonthlySalary(BigDecimal netMonthlySalary) {
        this.netMonthlySalary = netMonthlySalary;
    }

    public BigDecimal getNetSalary() {
        return netSalary;
    }

    public void setNetSalary(BigDecimal netSalary) {
        this.netSalary = netSalary;
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
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.autoCalculateCTCComponents();
    }

    /**
     * Auto-calculate all CTC components based on Annual CTC using standard industry percentages
     */
    public void autoCalculateCTCComponents() {
        if (this.annualCtc == null || this.annualCtc.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        // 💼 Standard CTC Structure Calculations
        
        // 1. Basic Salary (40% of CTC - standard percentage)
        this.basicSalary = this.annualCtc.multiply(new BigDecimal("0.40"))
                .setScale(2, RoundingMode.HALF_UP);

        // 2. HRA (50% of Basic for metro cities)
        this.hra = this.basicSalary.multiply(new BigDecimal("0.50"))
                .setScale(2, RoundingMode.HALF_UP);

        // 3. Conveyance Allowance (Fixed ₹19,200/year = ₹1,600/month)
        this.conveyanceAllowance = new BigDecimal("19200");

        // 4. Medical Allowance (Fixed ₹15,000/year - tax exempt if bills submitted)
        this.medicalAllowance = new BigDecimal("15000");

        // 5. Performance Bonus (10% of CTC)
        this.performanceBonus = this.annualCtc.multiply(new BigDecimal("0.10"))
                .setScale(2, RoundingMode.HALF_UP);

        // 6. Employer PF Contribution (12% of Basic)
        this.employerPfContribution = this.basicSalary.multiply(new BigDecimal("0.12"))
                .setScale(2, RoundingMode.HALF_UP);

        // 7. Gratuity (Calculated as 4.81% of Basic - industry standard)
        this.gratuity = this.basicSalary.multiply(new BigDecimal("0.0481"))
                .setScale(2, RoundingMode.HALF_UP);

        // 8. Other Benefits (Fixed ₹25,000/year - insurance, LTA etc.)
        this.otherBenefits = new BigDecimal("25000");

        // 9. Special Allowance (Residual = CTC - sum of all other components)
        BigDecimal totalFixedComponents = this.basicSalary
                .add(this.hra)
                .add(this.conveyanceAllowance)
                .add(this.medicalAllowance)
                .add(this.performanceBonus)
                .add(this.employerPfContribution)
                .add(this.gratuity)
                .add(this.otherBenefits);
        
        this.specialAllowance = this.annualCtc.subtract(totalFixedComponents)
                .setScale(2, RoundingMode.HALF_UP);

        // Ensure Special Allowance is not negative
        if (this.specialAllowance.compareTo(BigDecimal.ZERO) < 0) {
            this.specialAllowance = BigDecimal.ZERO;
        }

        // 💸 Monthly Deductions Calculations
        
        // 1. Employee PF (12% of Basic)
        this.employeePf = this.basicSalary.multiply(new BigDecimal("0.12"))
                .setScale(2, RoundingMode.HALF_UP);

        // 1.1. Provident Fund (Same as Employee PF for database compatibility)
        this.providentFund = this.employeePf;

        // 2. Professional Tax (₹200/month standard)
        this.professionalTax = new BigDecimal("2400"); // ₹200 × 12 months

        // 3. TDS (Estimated based on salary - tiered calculation)
        BigDecimal monthlyGrossForTax = this.annualCtc.divide(new BigDecimal("12"), 2, RoundingMode.HALF_UP);
        if (monthlyGrossForTax.compareTo(new BigDecimal("50000")) > 0) {
            this.tds = monthlyGrossForTax.multiply(new BigDecimal("0.10")).multiply(new BigDecimal("12"))
                    .setScale(2, RoundingMode.HALF_UP);
        } else if (monthlyGrossForTax.compareTo(new BigDecimal("25000")) > 0) {
            this.tds = monthlyGrossForTax.multiply(new BigDecimal("0.05")).multiply(new BigDecimal("12"))
                    .setScale(2, RoundingMode.HALF_UP);
        } else {
            this.tds = BigDecimal.ZERO;
        }

        // 4. Insurance Premium (1% of monthly gross * 12)
        BigDecimal monthlyGrossForInsurance = this.annualCtc.divide(new BigDecimal("12"), 2, RoundingMode.HALF_UP);
        this.insurancePremium = monthlyGrossForInsurance.multiply(new BigDecimal("0.01")).multiply(new BigDecimal("12"))
                .setScale(2, RoundingMode.HALF_UP);

        // 5. Other Deductions (Default to 0)
        if (this.otherDeductions == null) {
            this.otherDeductions = BigDecimal.ZERO;
        }

        // 6. Income Tax (Default to 0)
        if (this.incomeTax == null) {
            this.incomeTax = BigDecimal.ZERO;
        }

        // Calculate Monthly Figures
        
        // Gross Monthly Salary
        BigDecimal grossAnnualEarnings = this.basicSalary
                .add(this.hra)
                .add(this.conveyanceAllowance)
                .add(this.medicalAllowance)
                .add(this.specialAllowance)
                .add(this.performanceBonus)
                .add(this.otherBenefits);
        
        this.grossMonthlySalary = grossAnnualEarnings.divide(new BigDecimal("12"), 2, RoundingMode.HALF_UP);

        // Total Monthly Deductions
        BigDecimal totalAnnualDeductions = this.employeePf
                .add(this.professionalTax)
                .add(this.tds)
                .add(this.insurancePremium)
                .add(this.otherDeductions)
                .add(this.incomeTax);
        
        this.totalMonthlyDeductions = totalAnnualDeductions.divide(new BigDecimal("12"), 2, RoundingMode.HALF_UP);

        // Net Monthly Salary
        this.netMonthlySalary = this.grossMonthlySalary.subtract(this.totalMonthlyDeductions)
                .setScale(2, RoundingMode.HALF_UP);
        
        // Set netSalary same as netMonthlySalary for database compatibility
        this.netSalary = this.netMonthlySalary;
    }

    // Backward compatibility methods for legacy services
    public BigDecimal getAllowances() {
        // Sum of conveyance, medical and special allowances
        return (conveyanceAllowance != null ? conveyanceAllowance : BigDecimal.ZERO)
                .add(medicalAllowance != null ? medicalAllowance : BigDecimal.ZERO)
                .add(specialAllowance != null ? specialAllowance : BigDecimal.ZERO);
    }

    public void setAllowances(BigDecimal allowances) {
        // For backward compatibility, set as special allowance
        this.specialAllowance = allowances;
    }

    public BigDecimal getBonuses() {
        return this.performanceBonus;
    }

    public void setBonuses(BigDecimal bonuses) {
        this.performanceBonus = bonuses;
    }

    public BigDecimal getPfContribution() {
        return this.employerPfContribution;
    }

    public void setPfContribution(BigDecimal pfContribution) {
        this.employerPfContribution = pfContribution;
    }

    public BigDecimal getTotalCtc() {
        return this.annualCtc;
    }

    public void setTotalCtc(BigDecimal totalCtc) {
        this.annualCtc = totalCtc;
    }

    public void calculateTotalCtc() {
        // For backward compatibility, call the auto-calculation method
        calculateCTCStructure();
    }
}
