package com.payflowapi.controller;

import org.springframework.beans.factory.annotation.Autowired;
import com.payflowapi.repository.EmployeeRepository;
import com.payflowapi.repository.AnnouncementRepository;
import com.payflowapi.repository.CalendarEventRepository;
import com.payflowapi.repository.EmployeeLeaveRepository;
import com.payflowapi.repository.OnboardingRepository;
import com.payflowapi.repository.OnboardingCandidateRepository;
import com.payflowapi.repository.ProjectRepository;
import com.payflowapi.repository.ProjectTeamMemberRepository;
import com.payflowapi.repository.PayrollRepository;
import com.payflowapi.entity.Employee;
import com.payflowapi.entity.Announcement;
import com.payflowapi.entity.CalendarEvent;
import com.payflowapi.entity.EmployeeLeave;
import com.payflowapi.entity.Onboarding;
import com.payflowapi.entity.OnboardingCandidate;
import com.payflowapi.entity.Project;
import com.payflowapi.entity.ProjectTeamMember;
import com.payflowapi.entity.Payroll;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class HrDashboardController {

        @Autowired
        private EmployeeRepository employeeRepository;
        @Autowired
        private AnnouncementRepository announcementRepository;
        @Autowired
        private CalendarEventRepository calendarEventRepository;
        @Autowired
        private EmployeeLeaveRepository employeeLeaveRepository;
        @Autowired
        private OnboardingRepository onboardingRepository;
        @Autowired
        private OnboardingCandidateRepository onboardingCandidateRepository;
        @Autowired
        private ProjectRepository projectRepository;
        @Autowired
        private ProjectTeamMemberRepository projectTeamMemberRepository;
        @Autowired
        private PayrollRepository payrollRepository;

        // --- Announcements ---
        @GetMapping("/announcements")
        public List<Map<String, String>> getAnnouncements() {
                List<Map<String, String>> list = new ArrayList<>();
                List<Announcement> announcements = announcementRepository.findAll();
                for (Announcement a : announcements) {
                        list.add(Map.of("message", a.getMessage()));
                }
                return list;
        }

        // --- Employees on Leave ---
        @GetMapping("/leave/today")
        public List<Map<String, String>> getEmployeesOnLeave() {
                List<Map<String, String>> list = new ArrayList<>();
                List<EmployeeLeave> leaves = employeeLeaveRepository.findAll();
                for (EmployeeLeave leave : leaves) {
                        list.add(Map.of(
                                        "name", leave.getEmployeeName(),
                                        "type", leave.getType(),
                                        "from", leave.getFromDate() != null ? leave.getFromDate().toString() : "N/A",
                                        "to", leave.getToDate() != null ? leave.getToDate().toString() : "N/A"));
                }
                return list;
        }

        // --- Calendar Events ---
        @GetMapping("/calendar/events")
        public List<Map<String, String>> getCalendarEvents() {
                List<Map<String, String>> list = new ArrayList<>();
                List<CalendarEvent> events = calendarEventRepository.findAll();
                for (CalendarEvent event : events) {
                        list.add(Map.of(
                                        "time", event.getTime(),
                                        "title", event.getTitle(),
                                        "color", event.getColor()));
                }
                return list;
        }

        // --- Onboarding Summary ---
        @GetMapping("/onboarding/summary")
        public List<Map<String, Object>> getOnboardingSummary() {
                List<Map<String, Object>> list = new ArrayList<>();
                List<Onboarding> onboardings = onboardingRepository.findAll();
                for (Onboarding onboarding : onboardings) {
                        List<Map<String, String>> candidatesList = new ArrayList<>();
                        List<OnboardingCandidate> candidates = onboardingCandidateRepository.findAll();
                        for (OnboardingCandidate candidate : candidates) {
                                if (candidate.getOnboardingId() != null
                                                && candidate.getOnboardingId().equals(onboarding.getId())) {
                                        candidatesList.add(Map.of("avatar", candidate.getAvatar()));
                                }
                        }
                        list.add(Map.of(
                                        "code", onboarding.getCode(),
                                        "position", onboarding.getPosition(),
                                        "candidates", candidatesList,
                                        "deadline",
                                        onboarding.getDeadline() != null ? onboarding.getDeadline().toString() : "N/A",
                                        "status", onboarding.getStatus()));
                }
                return list;
        }

        // --- Project Summary ---
        @GetMapping("/projects/summary")
        public List<Map<String, Object>> getProjectSummary() {
                List<Map<String, Object>> list = new ArrayList<>();
                List<Project> projects = projectRepository.findAll();
                for (Project project : projects) {
                        List<Map<String, String>> teamList = new ArrayList<>();
                        List<ProjectTeamMember> teamMembers = projectTeamMemberRepository.findAll();
                        for (ProjectTeamMember member : teamMembers) {
                                if (member.getProjectId() != null && member.getProjectId().equals(project.getId())) {
                                        teamList.add(Map.of("avatar", member.getAvatar()));
                                }
                        }
                        list.add(Map.of(
                                        "name", project.getName(),
                                        "manager", project.getManager(),
                                        "team", teamList,
                                        "status", project.getStatus(),
                                        "deadline",
                                        project.getDeadline() != null ? project.getDeadline().toString() : "N/A"));
                }
                return list;
        }

        // --- Payroll Summary ---
        @GetMapping("/payroll/summary")
        public Map<String, Object> getPayrollSummary() {
                List<Payroll> payrolls = payrollRepository.findAll();
                double totalPaid = payrolls.stream().filter(p -> "Paid".equalsIgnoreCase(p.getStatus()))
                                .mapToDouble(Payroll::getNetSalary).sum();
                double pending = payrolls.stream().filter(p -> "Pending".equalsIgnoreCase(p.getStatus()))
                                .mapToDouble(Payroll::getNetSalary).sum();
                String cycle = payrolls.isEmpty() ? "N/A" : payrolls.get(0).getCycle();
                return Map.of(
                                "totalPaid", totalPaid,
                                "pending", pending,
                                "cycle", cycle);
        }

        // --- Payroll Table ---
        @GetMapping("/payroll/table")
        public List<Map<String, Object>> getPayrollTable() {
                // Example: Use employee table for payroll rows (fake salary)
                List<Map<String, Object>> list = new ArrayList<>();
                List<Employee> employees = employeeRepository.findAll();
                int i = 0;
                for (Employee e : employees) {
                        list.add(Map.of(
                                        "employee", e.getFullName(),
                                        "department", e.getDepartment() == null ? "-" : e.getDepartment(),
                                        "netSalary", 40000 + (i * 1000),
                                        "status", (i % 2 == 0 ? "Paid" : "Pending"),
                                        "paymentDate", (i % 2 == 0 ? "02/07/2025" : "-")));
                        i++;
                }
                return list;
        }

        // --- Gender Stats ---
        @GetMapping("/employee/gender-stats")
        public Map<String, Integer> getGenderStats() {
                int male = 0, female = 0;
                List<Employee> employees = employeeRepository.findAll();
                for (Employee e : employees) {
                        if (e.getGender() != null && e.getGender().equalsIgnoreCase("male"))
                                male++;
                        if (e.getGender() != null && e.getGender().equalsIgnoreCase("female"))
                                female++;
                }
                return Map.of("male", male, "female", female);
        }
}
