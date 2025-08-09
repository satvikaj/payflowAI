package com.payflowapi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

/**
 * Configuration class for scheduled tasks
 * Configures thread pool for scheduled task execution
 */
@Configuration
public class SchedulingConfig {

    /**
     * Configure task scheduler with dedicated thread pool
     * This ensures scheduled tasks don't interfere with web requests
     */
    @Bean
    public TaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(2); // Small pool size since we have few scheduled tasks
        scheduler.setThreadNamePrefix("payroll-scheduler-");
        scheduler.setWaitForTasksToCompleteOnShutdown(true);
        scheduler.setAwaitTerminationSeconds(30);
        return scheduler;
    }
}
