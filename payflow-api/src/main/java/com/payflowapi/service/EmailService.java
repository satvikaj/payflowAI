// ...existing code...
package com.payflowapi.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    public void sendNotificationEmail(String toEmail, String subject, String messageBody) {
        System.out.println("Sending notification email to " + toEmail);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(messageBody);

        mailSender.send(message);

        System.out.println("Notification email sent successfully to " + toEmail);
    }

    @Autowired
    private JavaMailSender mailSender;

    public void sendUserCredentials(String toEmail, String username, String password) {
        System.out.println("Sending email to " + toEmail); // log to check

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("PayFlow Login Credentials");
        message.setText("Hello,\n\nYour PayFlow account has been created.\n\nUsername: " + username + "\nPassword: " + password + "\n\nPlease log in and reset your password.\n\n- PayFlow Team");

        mailSender.send(message);

        System.out.println("Email sent successfully to " + toEmail);
    }
}