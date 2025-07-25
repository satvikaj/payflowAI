
package com.payflowapi.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "project_team_member")
@Data
public class ProjectTeamMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long projectId;
    private String avatar;
}
