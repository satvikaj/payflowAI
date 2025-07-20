package com.payflowapi.repository;

import com.payflowapi.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

// ✅ This interface handles database operations for the User entity
public interface UserRepository extends JpaRepository<User, Long> {
    
    // ✅ Custom query to find user by username (email)
    Optional<User> findByUsername(String username);
}
