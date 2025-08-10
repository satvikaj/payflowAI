package com.payflowapi.service;

import com.payflowapi.entity.Employee;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class NotificationService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    /**
     * Send payment hold notification to employee
     */
    public void sendPaymentHoldNotification(Employee employee, String holdReason, String holdByUserRole,
            Integer holdMonth, Integer holdYear) {
        try {
            String monthName = java.time.Month.of(holdMonth).name();
            String subject = String.format("Payment Hold Notice - %s %d", monthName, holdYear);

            String message = String.format(
                    "Dear %s,\n\n" +
                            "We want to inform you that your payment for %s %d has been placed on hold.\n\n" +
                            "Hold Reason: %s\n" +
                            "Hold Placed By: %s\n" +
                            "Hold Date: %s\n\n" +
                            "Please contact your HR department or manager for more information.\n\n" +
                            "Best regards,\n" +
                            "PayFlow System",
                    employee.getFullName(),
                    monthName,
                    holdYear,
                    holdReason != null ? holdReason : "Administrative review",
                    holdByUserRole,
                    LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy")));

            // Send email if mail sender is available
            if (mailSender != null && employee.getEmail() != null) {
                SimpleMailMessage mailMessage = new SimpleMailMessage();
                mailMessage.setTo(employee.getEmail());
                mailMessage.setSubject(subject);
                mailMessage.setText(message);
                mailMessage.setFrom("payflow@company.com");

                mailSender.send(mailMessage);
                System.out.println("Payment hold notification email sent to: " + employee.getEmail());
            } else {
                System.out.println("Email notification not sent - mail service not configured");
                System.out.println("Hold notification for: " + employee.getFullName() + " - " + holdReason);
            }

        } catch (Exception e) {
            System.err.println("Error sending payment hold notification: " + e.getMessage());
        }
    }

    /**
     * Send payment hold release notification to employee
     */
    public void sendPaymentHoldReleaseNotification(Employee employee, String releasedByUserRole) {
        try {
            String subject = "Payment Hold Released - "
                    + LocalDate.now().format(DateTimeFormatter.ofPattern("MMM yyyy"));

            String message = String.format(
                    "Dear %s,\n\n" +
                            "Good news! The hold on your payment has been released.\n\n" +
                            "Released By: %s\n" +
                            "Release Date: %s\n\n" +
                            "Your payment will be processed according to the normal schedule.\n\n" +
                            "Best regards,\n" +
                            "PayFlow System",
                    employee.getFullName(),
                    releasedByUserRole,
                    LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy")));

            // Send email if mail sender is available
            if (mailSender != null && employee.getEmail() != null) {
                SimpleMailMessage mailMessage = new SimpleMailMessage();
                mailMessage.setTo(employee.getEmail());
                mailMessage.setSubject(subject);
                mailMessage.setText(message);
                mailMessage.setFrom("payflow@company.com");

                mailSender.send(mailMessage);
                System.out.println("Payment hold release notification email sent to: " + employee.getEmail());
            } else {
                System.out.println("Email notification not sent - mail service not configured");
                System.out.println("Hold release notification for: " + employee.getFullName());
            }

        } catch (Exception e) {
            System.err.println("Error sending payment hold release notification: " + e.getMessage());
        }
    }
}
