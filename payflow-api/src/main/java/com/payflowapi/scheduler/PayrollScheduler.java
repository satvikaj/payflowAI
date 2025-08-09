package com.payflowapi.scheduler;

import com.payflowapi.service.PayslipService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Scheduler component for automatic payroll generation
 * Generates payslips for all employees at the end of each month
 */
@Component
public class PayrollScheduler {

    private static final Logger logger = LoggerFactory.getLogger(PayrollScheduler.class);

    @Autowired
    private PayslipService payslipService;

    /**
     * Automatically generate payslips for all employees at the end of each month
     * Runs at 11:59 PM on the last day of each month
     * Cron expression: "0 59 23 L * ?" means:
     * - 0 seconds
     * - 59 minutes
     * - 23 hours (11 PM)
     * - L (last day of month)
     * - * (any month)
     * - ? (any day of week)
     */
    @Scheduled(cron = "0 59 23 L * ?")
    public void generateMonthlyPayrollAutomatically() {
        try {
            LocalDate currentDate = LocalDate.now();
            String currentMonth = currentDate.format(DateTimeFormatter.ofPattern("MMMM")); // e.g., "January"
            Integer currentYear = currentDate.getYear();

            logger.info("Starting automatic payroll generation for {} {}", currentMonth, currentYear);

            // Generate payslips for all eligible employees
            var generatedPayslips = payslipService.generateBulkPayslips(
                    currentMonth,
                    currentYear,
                    "SYSTEM_AUTO_SCHEDULER");

            logger.info("Successfully generated {} payslips automatically for {} {}",
                    generatedPayslips.size(), currentMonth, currentYear);

            // Log individual payslip generation details
            generatedPayslips.forEach(payslip -> logger.debug("Generated payslip ID: {} for Employee ID: {}",
                    payslip.getPayslipId(), payslip.getEmployeeId()));

        } catch (Exception e) {
            logger.error("Failed to generate automatic payroll: {}", e.getMessage(), e);
            // Optionally, you could send an alert email to admin here
        }
    }

    /**
     * Optional: Test method that runs every minute for testing purposes
     * Remove this method in production or disable by commenting out the @Scheduled
     * annotation
     */
    // @Scheduled(cron = "0 * * * * ?") // Runs every minute - FOR TESTING ONLY
    public void testScheduler() {
        logger.info("🧪 TEST SCHEDULER: Payroll scheduler is active at: {}", LocalDate.now());

        // Test the actual payroll generation logic (uncomment for full test)
        // try {
        // LocalDate currentDate = LocalDate.now();
        // String currentMonth =
        // currentDate.format(DateTimeFormatter.ofPattern("MMMM"));
        // Integer currentYear = currentDate.getYear();
        // logger.info("🧪 TEST: Would generate payroll for {} {}", currentMonth,
        // currentYear);
        // } catch (Exception e) {
        // logger.error("🧪 TEST ERROR: {}", e.getMessage(), e);
        // }
    }

    /**
     * Optional: Generate payroll for previous month if missed
     * Runs at 12:05 AM on the 1st day of each month to catch any missed generations
     */
    @Scheduled(cron = "0 5 0 1 * ?")
    public void generateMissedPayroll() {
        try {
            LocalDate previousMonth = LocalDate.now().minusMonths(1);
            String monthName = previousMonth.format(DateTimeFormatter.ofPattern("MMMM"));
            Integer year = previousMonth.getYear();

            logger.info("Checking for missed payroll generation for {} {}", monthName, year);

            // Check if any payslips exist for the previous month
            var existingPayslips = payslipService.getPayslipsByMonthYear(monthName, year);

            if (existingPayslips.isEmpty()) {
                logger.warn("No payslips found for {} {}, generating missed payroll", monthName, year);

                var generatedPayslips = payslipService.generateBulkPayslips(
                        monthName,
                        year,
                        "SYSTEM_MISSED_PAYROLL");

                logger.info("Generated {} missed payslips for {} {}",
                        generatedPayslips.size(), monthName, year);
            } else {
                logger.info("Payslips already exist for {} {} - {} payslips found",
                        monthName, year, existingPayslips.size());
            }

        } catch (Exception e) {
            logger.error("Failed to check/generate missed payroll: {}", e.getMessage(), e);
        }
    }

    /**
     * 🧪 TEMPORARY TEST: Runs 2 minutes from now to test end-of-month logic
     * Enable by uncommenting @Scheduled and restart server
     * REMOVE AFTER TESTING!
     */
    // @Scheduled(fixedDelay = 120000, initialDelay = 120000) // Runs once, 2
    // minutes after startup
    public void testEndOfMonthScheduler() {
        try {
            LocalDate currentDate = LocalDate.now();
            String currentMonth = currentDate.format(DateTimeFormatter.ofPattern("MMMM"));
            Integer currentYear = currentDate.getYear();

            logger.info("🧪 END-OF-MONTH TEST: Starting payroll generation for {} {}", currentMonth, currentYear);

            // Actual payroll generation (same logic as production)
            var generatedPayslips = payslipService.generateBulkPayslips(
                    currentMonth,
                    currentYear,
                    "SYSTEM_TEST_SCHEDULER");

            logger.info("🧪 END-OF-MONTH TEST: Successfully generated {} payslips for {} {}",
                    generatedPayslips.size(), currentMonth, currentYear);

        } catch (Exception e) {
            logger.error("🧪 END-OF-MONTH TEST FAILED: {}", e.getMessage(), e);
        }
    }
}
