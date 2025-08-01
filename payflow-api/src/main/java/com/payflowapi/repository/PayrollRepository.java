package com.payflowapi.repository;

import com.payflowapi.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    @Query(value = "SELECT * FROM payroll p WHERE p.cycle = :cycle GROUP BY p.employee_id", nativeQuery = true)
    List<Payroll> findOnePerEmployee(@Param("cycle") String cycle);

        List<Payroll> findByEmployeeId(Long employeeId);
    Payroll findByEmployeeIdAndCycle(Long employeeId, String cycle);

}
