
package com.payflowapi.repository;

import java.util.List;

import com.payflowapi.entity.EmployeeLeave;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeLeaveRepository extends JpaRepository<EmployeeLeave, Long> {
    List<EmployeeLeave> findByEmployeeIdIn(List<Long> employeeIds);
}
