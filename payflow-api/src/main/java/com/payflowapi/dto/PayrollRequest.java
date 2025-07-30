package com.payflowapi.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class PayrollRequest {
    private Long employeeId;
    private Double baseSalary;
    private String department;
    private String cycle;
    private LocalDate paymentDate;
}