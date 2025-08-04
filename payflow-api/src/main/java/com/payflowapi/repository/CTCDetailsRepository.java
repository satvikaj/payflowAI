package com.payflowapi.repository;

import com.payflowapi.entity.CTCDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CTCDetailsRepository extends JpaRepository<CTCDetails, Long> {

        // Find all CTC records for an employee
        List<CTCDetails> findByEmployeeIdOrderByEffectiveFromDesc(Long employeeId);

        // Find current active CTC for an employee
        @Query("SELECT c FROM CTCDetails c WHERE c.employeeId = :employeeId AND c.status = 'ACTIVE' AND c.effectiveFrom <= :currentDate ORDER BY c.effectiveFrom DESC")
        Optional<CTCDetails> findCurrentCTCByEmployeeId(@Param("employeeId") Long employeeId,
                        @Param("currentDate") LocalDate currentDate);

        // Find latest CTC for an employee
        Optional<CTCDetails> findTopByEmployeeIdOrderByEffectiveFromDesc(Long employeeId);

        // Find all active CTC records
        List<CTCDetails> findByStatusOrderByEmployeeIdAsc(String status);

        // Find CTC records by date range
        @Query("SELECT c FROM CTCDetails c WHERE c.effectiveFrom BETWEEN :startDate AND :endDate ORDER BY c.effectiveFrom DESC")
        List<CTCDetails> findByEffectiveFromBetween(@Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        // Check if employee has CTC record
        boolean existsByEmployeeId(Long employeeId);

        // Find CTC records created by specific user
        List<CTCDetails> findByCreatedByOrderByCreatedAtDesc(String createdBy);
}
