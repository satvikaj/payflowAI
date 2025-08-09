package com.payflowapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication // Enables auto-configuration and component scanning
@EnableScheduling // Enables scheduled task execution
public class PayflowApiApplication {
	public static void main(String[] args) {
		// This line starts the Spring Boot application
		SpringApplication.run(PayflowApiApplication.class, args);
	}
}
