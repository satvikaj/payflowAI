package com.payflowapi.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

import lombok.Data;

@Entity
@Data
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    private String department;
    private String role;
    private String email;
    private String phone;
    private String address;
    private String joiningDate;

    private String hasExperience; // "Yes" or "No"
    private String experienceYears;
    private String previousRole;
    private String previousCompany;
}
