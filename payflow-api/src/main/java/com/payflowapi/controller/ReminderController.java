package com.payflowapi.controller;

import com.payflowapi.entity.Reminder;
import com.payflowapi.service.ReminderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reminders")
public class ReminderController {
    @Autowired
    private ReminderService reminderService;

    @PostMapping("/add")
    public Reminder addReminder(@RequestBody Reminder reminder) {
        return reminderService.addReminder(reminder);
    }

    @GetMapping("/manager/{managerId}")
    public List<Reminder> getRemindersForManager(@PathVariable Long managerId) {
        return reminderService.getRemindersForManager(managerId);
    }

    @GetMapping("/employee/{employeeId}")
    public List<Reminder> getRemindersForEmployee(@PathVariable Long employeeId) {
        return reminderService.getRemindersForEmployee(employeeId);
    }

    @PostMapping("/notify/{managerId}")
    public void notifyEmployees(@PathVariable Long managerId, @RequestBody NotifyRequest request) {
        reminderService.notifyEmployees(managerId, request.employeeIds, request.reminder);
    }

    public static class NotifyRequest {
        public List<Long> employeeIds;
        public Reminder reminder;
    }
}
