package com.payflowapi.dto;

import lombok.Data;

@Data
public class EmployeeDto {
    private String fullName;
    private String dob;
    private String gender;
    private String address;

    private String email;
    private String phone;
    private String emergencyContact;

    private String qualification;
    private String institution;
    private String graduationYear;
    private String specialization;

    private String department;
    private String role;
    private String joiningDate;

    private String hasExperience;
    private String experienceYears;
    private String previousRole;
    private String previousCompany;

    private String certifications;
    private String skills;
    private String languages;
}