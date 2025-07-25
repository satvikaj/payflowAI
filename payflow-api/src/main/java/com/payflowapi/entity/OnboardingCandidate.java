
package com.payflowapi.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "onboarding_candidate")
@Data
public class OnboardingCandidate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long onboardingId;
    private String avatar;
}
