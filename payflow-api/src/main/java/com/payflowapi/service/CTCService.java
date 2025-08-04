package com.payflowapi.service;

import com.payflowapi.entity.CTCDetails;
import com.payflowapi.entity.Employee;
import com.payflowapi.repository.CTCDetailsRepository;
import com.payflowapi.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class CTCService {

    @Autowired
    private CTCDetailsRepository ctcDetailsRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    // Add new CTC for employee
    public CTCDetails addCTC(CTCDetails ctcDetails) {
        // Validate employee exists
        Optional<Employee> employee = employeeRepository.findById(ctcDetails.getEmployeeId());
        if (employee.isEmpty()) {
            throw new RuntimeException("Employee not found with ID: " + ctcDetails.getEmployeeId());
        }

        // Set effective date if not provided
        if (ctcDetails.getEffectiveFrom() == null) {
            ctcDetails.setEffectiveFrom(LocalDate.now());
        }

        // Calculate total CTC
        ctcDetails.calculateTotalCtc();

        // Deactivate previous CTC records for this employee
        List<CTCDetails> previousCTCs = ctcDetailsRepository
                .findByEmployeeIdOrderByEffectiveFromDesc(ctcDetails.getEmployeeId());
        for (CTCDetails prevCTC : previousCTCs) {
            if (prevCTC.getStatus().equals("ACTIVE")) {
                prevCTC.setStatus("INACTIVE");
                ctcDetailsRepository.save(prevCTC);
            }
        }

        return ctcDetailsRepository.save(ctcDetails);
    }

    // Update existing CTC
    public CTCDetails updateCTC(Long ctcId, CTCDetails updatedCTC) {
        Optional<CTCDetails> existingCTC = ctcDetailsRepository.findById(ctcId);
        if (existingCTC.isEmpty()) {
            throw new RuntimeException("CTC record not found with ID: " + ctcId);
        }

        CTCDetails ctc = existingCTC.get();
        ctc.setBasicSalary(updatedCTC.getBasicSalary());
        ctc.setHra(updatedCTC.getHra());
        ctc.setAllowances(updatedCTC.getAllowances());
        ctc.setBonuses(updatedCTC.getBonuses());
        ctc.setPfContribution(updatedCTC.getPfContribution());
        ctc.setGratuity(updatedCTC.getGratuity());
        ctc.setRevisionReason(updatedCTC.getRevisionReason());
        ctc.calculateTotalCtc();

        return ctcDetailsRepository.save(ctc);
    }

    // Get current CTC for employee
    public Optional<CTCDetails> getCurrentCTC(Long employeeId) {
        // First try to find with date and status restrictions
        Optional<CTCDetails> currentCTC = ctcDetailsRepository.findCurrentCTCByEmployeeId(employeeId, LocalDate.now());

        // If not found, try to find the latest CTC record regardless of date/status
        if (currentCTC.isEmpty()) {
            return ctcDetailsRepository.findTopByEmployeeIdOrderByEffectiveFromDesc(employeeId);
        }

        return currentCTC;
    }

    // Get CTC history for employee
    public List<CTCDetails> getCTCHistory(Long employeeId) {
        return ctcDetailsRepository.findByEmployeeIdOrderByEffectiveFromDesc(employeeId);
    }

    // Get all active CTC records
    public List<CTCDetails> getAllActiveCTCs() {
        return ctcDetailsRepository.findByStatusOrderByEmployeeIdAsc("ACTIVE");
    }

    // Get CTC by ID
    public Optional<CTCDetails> getCTCById(Long ctcId) {
        return ctcDetailsRepository.findById(ctcId);
    }

    // Delete CTC (soft delete)
    public void deleteCTC(Long ctcId) {
        Optional<CTCDetails> ctc = ctcDetailsRepository.findById(ctcId);
        if (ctc.isPresent()) {
            CTCDetails ctcDetails = ctc.get();
            ctcDetails.setStatus("DELETED");
            ctcDetailsRepository.save(ctcDetails);
        } else {
            throw new RuntimeException("CTC record not found with ID: " + ctcId);
        }
    }

    // Check if employee has CTC
    public boolean hasEmployeeCTC(Long employeeId) {
        return ctcDetailsRepository.existsByEmployeeId(employeeId);
    }

    // Get CTC records by date range
    public List<CTCDetails> getCTCByDateRange(LocalDate startDate, LocalDate endDate) {
        return ctcDetailsRepository.findByEffectiveFromBetween(startDate, endDate);
    }

    // Get CTC records created by user
    public List<CTCDetails> getCTCByCreatedBy(String createdBy) {
        return ctcDetailsRepository.findByCreatedByOrderByCreatedAtDesc(createdBy);
    }
}
