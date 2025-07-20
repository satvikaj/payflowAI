package com.payflowapi.dto;

import lombok.Data;

@Data
public class EmployeeDto {

    private String fullName;
    private String department;
    private String role;
    private String email;
    private String phone;
    private String address;
    private String joiningDate;

    private String hasExperience;
    private String experienceYears;
    private String previousRole;
    private String previousCompany;
}
