package com.aimarket.projects;

import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ProjectController {
  private final ProjectService svc;

  public ProjectController(ProjectService svc) {
    this.svc = svc;
  }

  @GetMapping("/projects")
  public List<ProjectDtos.ProjectResponse> list(@RequestParam(required = false) String q) {
    return svc.list(q);
  }

  @PostMapping("/projects")
  public ResponseEntity<ProjectDtos.ProjectResponse> create(
      @Valid @RequestBody ProjectDtos.CreateProjectRequest req, Principal principal) {
    return ResponseEntity.ok(svc.create(req, principal.getName()));
  }

  @GetMapping("/projects/{projectId}")
  public ProjectDtos.ProjectDetailResponse get(@PathVariable Long projectId) {
    return svc.get(projectId);
  }

  @PostMapping("/projects/{projectId}/join")
  public ResponseEntity<?> join(@PathVariable Long projectId, Principal principal) {
    svc.join(projectId, principal.getName());
    return ResponseEntity.ok().build();
  }

  @GetMapping("/projects/{projectId}/tasks")
  public List<ProjectDtos.TaskResponse> listTasks(@PathVariable Long projectId, Principal principal) {
    return svc.listTasks(projectId, principal.getName());
  }

  @PostMapping("/projects/{projectId}/tasks")
  public ProjectDtos.TaskResponse addTask(
      @PathVariable Long projectId,
      @Valid @RequestBody ProjectDtos.CreateTaskRequest req,
      Principal principal) {
    return svc.addTask(projectId, req, principal.getName());
  }

  @PutMapping("/projects/{projectId}/tasks/{taskId}/status")
  public ProjectDtos.TaskResponse updateTaskStatus(
      @PathVariable Long projectId,
      @PathVariable Long taskId,
      @Valid @RequestBody ProjectDtos.UpdateTaskStatusRequest req,
      Principal principal) {
    return svc.updateTaskStatus(projectId, taskId, req.status(), principal.getName());
  }

  @GetMapping("/projects/{projectId}/contributions")
  public List<ProjectDtos.ContributionResponse> listContrib(@PathVariable Long projectId, Principal principal) {
    return svc.listContributions(projectId, principal.getName());
  }

  @PostMapping("/projects/{projectId}/contributions")
  public ProjectDtos.ContributionResponse addContrib(
      @PathVariable Long projectId,
      @Valid @RequestBody ProjectDtos.AddContributionRequest req,
      Principal principal) {
    return svc.addContribution(projectId, req, principal.getName());
  }

  @GetMapping("/leaderboard/projects")
  public List<ProjectDtos.ProjectLeaderboardRow> leaderboard(@RequestParam(defaultValue = "10") int limit) {
    return svc.leaderboard(limit);
  }
}

