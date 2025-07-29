package com.payflowapi.dto;

import lombok.Data;

@Data
public class LeaveRequestDto {
    private String email;
    private String type;
    private String startDate;
    private String endDate;
    private String reason;
}
