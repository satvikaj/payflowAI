
package com.payflowapi.repository;

import java.util.List;
import java.time.LocalDate;

import com.payflowapi.entity.EmployeeLeave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EmployeeLeaveRepository extends JpaRepository<EmployeeLeave, Long> {
    List<EmployeeLeave> findByEmployeeIdIn(List<Long> employeeIds);

    List<EmployeeLeave> findByEmployeeId(Long employeeId);

    List<EmployeeLeave> findByManagerId(Long managerId);

    List<EmployeeLeave> findByEmployeeIdAndStatus(Long employeeId, String status);

    @Query("SELECT el FROM EmployeeLeave el WHERE el.employeeId = :employeeId AND el.status = 'ACCEPTED' " +
            "AND el.toDate >= :startDate AND el.fromDate <= :endDate")
    List<EmployeeLeave> findApprovedLeavesInMonth(@Param("employeeId") Long employeeId,
                                                  @Param("startDate") LocalDate startDate,
                                                  @Param("endDate") LocalDate endDate);


    // Find overlapping leave requests for the same employee
    @Query("SELECT el FROM EmployeeLeave el WHERE el.employeeId = :employeeId " +
            "AND el.status != 'DENIED' " +
            "AND ((el.fromDate <= :toDate AND el.toDate >= :fromDate))")
    List<EmployeeLeave> findOverlappingLeaves(@Param("employeeId") Long employeeId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate);
}
