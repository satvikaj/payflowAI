package com.payflowapi.dto;

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
    private String position;
    private String joiningDate;
    private Long managerId;

    private String hasExperience;
    // For multiple experiences
    private java.util.List<ExperienceDto> experiences;

    private String certifications;
    private String skills;
    private String languages;

    // Nested DTO for experience
    public static class ExperienceDto {
        private String years;
        private String role;
        private String company;

        // Getters and Setters for ExperienceDto
        public String getYears() { return years; }
        public void setYears(String years) { this.years = years; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getCompany() { return company; }
        public void setCompany(String company) { this.company = company; }
    }

    // Getters and Setters
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmergencyContact() { return emergencyContact; }
    public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public String getInstitution() { return institution; }
    public void setInstitution(String institution) { this.institution = institution; }

    public String getGraduationYear() { return graduationYear; }
    public void setGraduationYear(String graduationYear) { this.graduationYear = graduationYear; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public String getJoiningDate() { return joiningDate; }
    public void setJoiningDate(String joiningDate) { this.joiningDate = joiningDate; }

    public Long getManagerId() { return managerId; }
    public void setManagerId(Long managerId) { this.managerId = managerId; }

    public String getHasExperience() { return hasExperience; }
    public void setHasExperience(String hasExperience) { this.hasExperience = hasExperience; }

    public java.util.List<ExperienceDto> getExperiences() { return experiences; }
    public void setExperiences(java.util.List<ExperienceDto> experiences) { this.experiences = experiences; }

    public String getCertifications() { return certifications; }
    public void setCertifications(String certifications) { this.certifications = certifications; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public String getLanguages() { return languages; }
    public void setLanguages(String languages) { this.languages = languages; }
}