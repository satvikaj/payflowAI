package com.payflowapi.repository;

import com.payflowapi.entity.ProjectTeamMember;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectTeamMemberRepository extends JpaRepository<ProjectTeamMember, Long> {
}
