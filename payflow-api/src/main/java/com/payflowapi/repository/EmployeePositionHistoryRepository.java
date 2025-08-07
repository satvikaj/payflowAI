package com.payflowapi.repository;

import com.payflowapi.entity.EmployeePositionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EmployeePositionHistoryRepository extends JpaRepository<EmployeePositionHistory, Long> {
    
    List<EmployeePositionHistory> findByEmployeeIdOrderByChangeDateDesc(Long employeeId);
    
    @Query("SELECT eph FROM EmployeePositionHistory eph WHERE eph.employeeId = :employeeId ORDER BY eph.changeDate DESC")
    List<EmployeePositionHistory> findPositionHistoryByEmployeeId(@Param("employeeId") Long employeeId);
}
