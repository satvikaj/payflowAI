package com.payflowapi.repository;

import com.payflowapi.entity.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByManagerIdAndEmployeeIdIsNullOrderByDateDescTimeDesc(Long managerId);
    List<Reminder> findByEmployeeIdOrderByDateDescTimeDesc(Long employeeId);
}
