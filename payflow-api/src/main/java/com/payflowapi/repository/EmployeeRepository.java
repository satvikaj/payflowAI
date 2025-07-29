package com.payflowapi.repository;

import java.util.List;

import com.payflowapi.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmail(String email);

    List<Employee> findByManagerId(Long managerId);
}
