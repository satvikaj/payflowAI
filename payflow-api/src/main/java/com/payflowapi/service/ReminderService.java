package com.payflowapi.service;

import com.payflowapi.entity.Reminder;
import com.payflowapi.repository.ReminderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ReminderService {
    @Autowired
    private ReminderRepository reminderRepository;

    public Reminder addReminder(Reminder reminder) {
        return reminderRepository.save(reminder);
    }

    public List<Reminder> getRemindersForManager(Long managerId) {
        return reminderRepository.findByManagerIdAndEmployeeIdIsNullOrderByDateDescTimeDesc(managerId);
    }

    public List<Reminder> getRemindersForEmployee(Long employeeId) {
        return reminderRepository.findByEmployeeIdOrderByDateDescTimeDesc(employeeId);
    }

    public void notifyEmployees(Long managerId, List<Long> employeeIds, Reminder reminder) {
        for (Long empId : employeeIds) {
            Reminder empReminder = new Reminder();
            empReminder.setManagerId(managerId);
            empReminder.setEmployeeId(empId);
            empReminder.setText(reminder.getText());
            empReminder.setDate(reminder.getDate());
            empReminder.setTime(reminder.getTime());
            empReminder.setNotified(true);
            reminderRepository.save(empReminder);
        }
        // Mark manager's reminder as notified
        if (reminder.getId() != null) {
            Reminder managerReminder = reminderRepository.findById(reminder.getId()).orElse(null);
            if (managerReminder != null) {
                managerReminder.setNotified(true);
                reminderRepository.save(managerReminder);
            }
        }
    }
}
