package com.payflowapi.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PayrollRequest {
    private Long employeeId;
//    private Double baseSalary;
    private String department;
    private String cycle;
    private LocalDate paymentDate;
    private BigDecimal baseSalary; // In the DTO itself

}