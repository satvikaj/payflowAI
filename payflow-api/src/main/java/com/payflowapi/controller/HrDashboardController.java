package com.payflowapi.controller;

import org.springframework.beans.factory.annotation.Autowired;
import com.payflowapi.repository.EmployeeRepository;
import com.payflowapi.entity.Employee;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class HrDashboardController {

        @Autowired
        private EmployeeRepository employeeRepository;

        // --- Announcements ---
        @GetMapping("/announcements")
        public List<Map<String, String>> getAnnouncements() {
                // Dummy data, replace with DB fetch
                List<Map<String, String>> list = new ArrayList<>();
                list.add(Map.of("message", "📢 Annual meet scheduled on 5th Aug"));
                list.add(Map.of("message", "🛡️ Security audit on 20th July"));
                return list;
        }

        // --- Employees on Leave ---
        @GetMapping("/leave/today")
        public List<Map<String, String>> getEmployeesOnLeave() {
                // Example: Return employees with 'Sick' or 'Casual' in certifications as a fake
                // leave marker
                List<Map<String, String>> list = new ArrayList<>();
                List<Employee> employees = employeeRepository.findAll();
                for (Employee e : employees) {
                        if (e.getCertifications() != null && (e.getCertifications().toLowerCase().contains("sick")
                                        || e.getCertifications().toLowerCase().contains("casual"))) {
                                list.add(Map.of(
                                                "name", e.getFullName(),
                                                "type", e.getCertifications(),
                                                "from", "N/A",
                                                "to", "N/A"));
                        }
                }
                return list;
        }

        // --- Calendar Events ---
        @GetMapping("/calendar/events")
        public List<Map<String, String>> getCalendarEvents() {
                List<Map<String, String>> list = new ArrayList<>();
                list.add(Map.of("time", "12PM", "title", "Business lunch at Pret", "color", "green"));
                list.add(Map.of("time", "1PM", "title", "Skype call with Kate", "color", "yellow"));
                list.add(Map.of("time", "4PM", "title", "HR team meeting", "color", "red"));
                return list;
        }

        // --- Onboarding Summary ---
        @GetMapping("/onboarding/summary")
        public List<Map<String, Object>> getOnboardingSummary() {
                List<Map<String, Object>> list = new ArrayList<>();
                list.add(Map.of(
                                "code", "CAB235",
                                "position", "Senior Business Developer",
                                "candidates", List.of(
                                                Map.of("avatar", "https://i.pravatar.cc/30?img=1"),
                                                Map.of("avatar", "https://i.pravatar.cc/30?img=2")),
                                "deadline", "29/05/2025",
                                "status", "Pending"));
                list.add(Map.of(
                                "code", "FBD114",
                                "position", "Senior Python Developer",
                                "candidates", List.of(
                                                Map.of("avatar", "https://i.pravatar.cc/30?img=3"),
                                                Map.of("avatar", "https://i.pravatar.cc/30?img=4"),
                                                Map.of("avatar", "https://i.pravatar.cc/30?img=5")),
                                "deadline", "30/05/2025",
                                "status", "Pending"));
                list.add(Map.of(
                                "code", "HKD099",
                                "position", "Junior Project Manager",
                                "candidates", List.of(
                                                Map.of("avatar", "https://i.pravatar.cc/30?img=6")),
                                "deadline", "12/06/2025",
                                "status", "Pending"));
                return list;
        }

        // --- Project Summary ---
        @GetMapping("/projects/summary")
        public List<Map<String, Object>> getProjectSummary() {
                List<Map<String, Object>> list = new ArrayList<>();
                list.add(Map.of(
                                "name", "HRMS Revamp",
                                "manager", "Ravi Kumar",
                                "team", List.of(
                                                Map.of("avatar", "https://i.pravatar.cc/30?img=8"),
                                                Map.of("avatar", "https://i.pravatar.cc/30?img=9"),
                                                Map.of("avatar", "https://i.pravatar.cc/30?img=10"),
                                                Map.of("avatar", "https://i.pravatar.cc/30?img=11"),
                                                Map.of("avatar", "https://i.pravatar.cc/30?img=12")),
                                "status", "In Progress",
                                "deadline", "31/08/2025"));
                list.add(Map.of(
                                "name", "Payroll Automation",
                                "manager", "Anjali Mehta",
                                "team", List.of(
                                                Map.of("avatar", "https://i.pravatar.cc/30?img=13"),
                                                Map.of("avatar", "https://i.pravatar.cc/30?img=14")),
                                "status", "Completed",
                                "deadline", "15/07/2025"));
                list.add(Map.of(
                                "name", "Onboarding Portal",
                                "manager", "Karthik Reddy",
                                "team", List.of(
                                                Map.of("avatar", "https://i.pravatar.cc/30?img=5"),
                                                Map.of("avatar", "https://i.pravatar.cc/30?img=6")),
                                "status", "Delayed",
                                "deadline", "22/07/2025"));
                return list;
        }

        // --- Payroll Summary ---
        @GetMapping("/payroll/summary")
        public Map<String, Object> getPayrollSummary() {
                return Map.of(
                                "totalPaid", 1245000,
                                "pending", 115000,
                                "cycle", "1st - 5th Every Month");
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
