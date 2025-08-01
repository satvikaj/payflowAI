package com.payflowapi.dto;

public class OnboardedEmployeeSummaryDTO {
    private String fullName;
    private String department;
    private String role;
    private String joiningDate;
    private String managerName;
    private String status;

    public OnboardedEmployeeSummaryDTO() {}

    public OnboardedEmployeeSummaryDTO(String fullName, String department, String role,
                                       String joiningDate, String managerName, String status) {
        this.fullName = fullName;
        this.department = department;
        this.role = role;
        this.joiningDate = joiningDate;
        this.managerName = managerName;
        this.status = status;
    }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getJoiningDate() { return joiningDate; }
    public void setJoiningDate(String joiningDate) { this.joiningDate = joiningDate; }

    public String getManagerName() { return managerName; }
    public void setManagerName(String managerName) { this.managerName = managerName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
