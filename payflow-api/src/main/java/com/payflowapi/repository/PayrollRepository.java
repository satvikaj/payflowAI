package com.payflowapi.repository;

import com.payflowapi.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    List<Payroll> findByEmployeeId(Long employeeId);
    Payroll findByEmployeeIdAndCycle(Long employeeId, String cycle);

}
