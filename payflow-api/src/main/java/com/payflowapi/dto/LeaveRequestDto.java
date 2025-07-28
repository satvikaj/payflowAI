package com.payflowapi.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class LeaveRequestDto {
    private String email;
    private String type;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
}
