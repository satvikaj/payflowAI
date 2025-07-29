package com.payflowapi.repository;

import com.payflowapi.entity.OnboardingCandidate;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OnboardingCandidateRepository extends JpaRepository<OnboardingCandidate, Long> {
}
