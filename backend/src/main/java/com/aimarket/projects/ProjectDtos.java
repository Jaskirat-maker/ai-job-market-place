package com.aimarket.projects;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;

public class ProjectDtos {
  public record CreateProjectRequest(
      @NotBlank @Size(min = 3, max = 140) String title,
      @NotBlank @Size(min = 10, max = 4000) String description,
      @NotBlank @Size(min = 2, max = 60) String stage) {}

  public record ProjectResponse(
      Long id,
      String title,
      String description,
      String stage,
      Instant createdAt,
      Long ownerId,
      String ownerName,
      long totalContributionPoints,
      int memberCount) {}

  public record MemberResponse(Long userId, String displayName, String role, Instant joinedAt) {}

  public record CreateTaskRequest(@NotBlank @Size(min = 2, max = 200) String title) {}

  public record UpdateTaskStatusRequest(@NotBlank String status) {}

  public record TaskResponse(Long id, String title, String status, Long assigneeId, Instant createdAt) {}

  public record AddContributionRequest(
      @NotBlank @Size(min = 3, max = 500) String summary, String type, Integer points) {}

  public record ContributionResponse(
      Long id, Long userId, String userName, String type, int points, String summary, Instant createdAt) {}

  public record ProjectLeaderboardRow(Long projectId, String title, long points) {}

  public record ProjectDetailResponse(ProjectResponse project, List<MemberResponse> members) {}
}

