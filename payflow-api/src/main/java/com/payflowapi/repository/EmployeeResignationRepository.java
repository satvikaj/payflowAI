package com.payflowapi.repository;

import com.payflowapi.entity.EmployeeResignation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeResignationRepository extends JpaRepository<EmployeeResignation, Long> {

    // Find resignations by employee ID
    List<EmployeeResignation> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);

    // Find resignations by employee email
    @Query("SELECT er FROM EmployeeResignation er WHERE er.employeeEmail = :email ORDER BY er.createdAt DESC")
    List<EmployeeResignation> findByEmployeeEmailOrderByCreatedAtDesc(@Param("email") String email);

    // Find pending resignations for a specific manager
    @Query("SELECT er FROM EmployeeResignation er WHERE er.managerId = :managerId AND er.status = 'PENDING' ORDER BY er.createdAt ASC")
    List<EmployeeResignation> findPendingResignationsByManager(@Param("managerId") Long managerId);

    // Find all pending resignations (for HR/Admin)
    @Query("SELECT er FROM EmployeeResignation er WHERE er.status = 'PENDING' ORDER BY er.createdAt ASC")
    List<EmployeeResignation> findAllPendingResignations();

    // Find resignations by status
    List<EmployeeResignation> findByStatusOrderByCreatedAtDesc(String status);

    // Find resignations by department (for HR)
    @Query("SELECT er FROM EmployeeResignation er WHERE er.department = :department ORDER BY er.createdAt DESC")
    List<EmployeeResignation> findByDepartmentOrderByCreatedAtDesc(@Param("department") String department);

    // Find resignations with last working day in a date range (for planning)
    @Query("SELECT er FROM EmployeeResignation er WHERE er.status = 'APPROVED' " +
            "AND er.approvedLastWorkingDay BETWEEN :startDate AND :endDate " +
            "ORDER BY er.approvedLastWorkingDay ASC")
    List<EmployeeResignation> findApprovedResignationsInDateRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // Count resignations by status for dashboard stats
    @Query("SELECT COUNT(er) FROM EmployeeResignation er WHERE er.status = :status")
    Long countByStatus(@Param("status") String status);

    // Find resignations requiring attention (pending > X days)
    @Query("SELECT er FROM EmployeeResignation er WHERE er.status = 'PENDING' " +
            "AND er.createdAt < :cutoffDate ORDER BY er.createdAt ASC")
    List<EmployeeResignation> findOverdueResignations(@Param("cutoffDate") java.time.LocalDateTime cutoffDate);

    // Check if employee has any pending resignation
    @Query("SELECT er FROM EmployeeResignation er WHERE er.employeeId = :employeeId " +
            "AND er.status IN ('PENDING', 'APPROVED') ORDER BY er.createdAt DESC")
    Optional<EmployeeResignation> findActiveResignationByEmployeeId(@Param("employeeId") Long employeeId);

    // Find resignations by manager for team overview
    @Query("SELECT er FROM EmployeeResignation er WHERE er.managerId = :managerId ORDER BY er.createdAt DESC")
    List<EmployeeResignation> findByManagerIdOrderByCreatedAtDesc(@Param("managerId") Long managerId);

    // Find resignations needing exit interview
    @Query("SELECT er FROM EmployeeResignation er WHERE er.status = 'APPROVED' " +
            "AND er.exitInterviewCompleted = false " +
            "AND er.approvedLastWorkingDay >= :today ORDER BY er.approvedLastWorkingDay ASC")
    List<EmployeeResignation> findResignationsNeedingExitInterview(@Param("today") LocalDate today);

    // Find resignations with incomplete handover
    @Query("SELECT er FROM EmployeeResignation er WHERE er.status = 'APPROVED' " +
            "AND er.handoverCompleted = false " +
            "AND er.approvedLastWorkingDay >= :today ORDER BY er.approvedLastWorkingDay ASC")
    List<EmployeeResignation> findResignationsWithIncompleteHandover(@Param("today") LocalDate today);

    // Monthly resignation stats
    @Query("SELECT COUNT(er) FROM EmployeeResignation er WHERE er.status = 'APPROVED' " +
            "AND YEAR(er.createdAt) = :year AND MONTH(er.createdAt) = :month")
    Long countApprovedResignationsByMonth(@Param("year") int year, @Param("month") int month);

    // Departmental resignation stats
    @Query("SELECT er.department, COUNT(er) FROM EmployeeResignation er " +
            "WHERE er.status = 'APPROVED' AND YEAR(er.createdAt) = :year " +
            "GROUP BY er.department ORDER BY COUNT(er) DESC")
    List<Object[]> getResignationStatsByDepartment(@Param("year") int year);

    // Find recent resignations (last 30 days)
    @Query("SELECT er FROM EmployeeResignation er WHERE er.createdAt >= :cutoffDate " +
            "ORDER BY er.createdAt DESC")
    List<EmployeeResignation> findRecentResignations(@Param("cutoffDate") java.time.LocalDateTime cutoffDate);
}
