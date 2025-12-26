package com.aimarket.projects;

import com.aimarket.users.AppUser;
import com.aimarket.users.UserRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ProjectService {
  private final ProjectRepository projects;
  private final ProjectMemberRepository members;
  private final TaskRepository tasks;
  private final ContributionRepository contributions;
  private final UserRepository users;

  public ProjectService(
      ProjectRepository projects,
      ProjectMemberRepository members,
      TaskRepository tasks,
      ContributionRepository contributions,
      UserRepository users) {
    this.projects = projects;
    this.members = members;
    this.tasks = tasks;
    this.contributions = contributions;
    this.users = users;
  }

  public List<ProjectDtos.ProjectResponse> list(String q) {
    List<Project> list =
        (q == null || q.isBlank()) ? projects.findAll() : projects.search(q.trim(), 50);
    return list.stream().map(this::toProjectResponse).toList();
  }

  public ProjectDtos.ProjectDetailResponse get(Long projectId) {
    Project p = projects.findById(projectId).orElseThrow();
    List<ProjectDtos.MemberResponse> memberDtos =
        members.listMembersWithUser(projectId).stream()
            .map(
                pm ->
                    new ProjectDtos.MemberResponse(
                        pm.getUser().getId(), pm.getUser().getDisplayName(), pm.getRole(), pm.getJoinedAt()))
            .toList();
    return new ProjectDtos.ProjectDetailResponse(toProjectResponse(p), memberDtos);
  }

  @Transactional
  public ProjectDtos.ProjectResponse create(ProjectDtos.CreateProjectRequest req, String ownerEmail) {
    AppUser owner = users.findByEmail(ownerEmail).orElseThrow();
    Project p = new Project();
    p.setTitle(req.title().trim());
    p.setDescription(req.description().trim());
    p.setStage(req.stage().trim());
    p.setOwner(owner);
    projects.save(p);

    ProjectMember pm = new ProjectMember();
    pm.setProject(p);
    pm.setUser(owner);
    pm.setRole("OWNER");
    members.save(pm);

    return toProjectResponse(p);
  }

  @Transactional
  public void join(Long projectId, String userEmail) {
    AppUser u = users.findByEmail(userEmail).orElseThrow();
    Project p = projects.findById(projectId).orElseThrow();
    if (members.findByProjectIdAndUserId(projectId, u.getId()).isPresent()) return;
    ProjectMember pm = new ProjectMember();
    pm.setProject(p);
    pm.setUser(u);
    pm.setRole("MEMBER");
    members.save(pm);
  }

  @Transactional
  public ProjectDtos.TaskResponse addTask(Long projectId, ProjectDtos.CreateTaskRequest req, String userEmail) {
    requireMember(projectId, userEmail);
    Project p = projects.findById(projectId).orElseThrow();
    TaskItem t = new TaskItem();
    t.setProject(p);
    t.setTitle(req.title().trim());
    tasks.save(t);
    return new ProjectDtos.TaskResponse(t.getId(), t.getTitle(), t.getStatus(), null, t.getCreatedAt());
  }

  @Transactional
  public ProjectDtos.TaskResponse updateTaskStatus(Long projectId, Long taskId, String status, String userEmail) {
    requireMember(projectId, userEmail);
    TaskItem t = tasks.findById(taskId).orElseThrow();
    if (!t.getProject().getId().equals(projectId)) throw new IllegalArgumentException("Task mismatch");
    t.setStatus(status.trim().toUpperCase());
    tasks.save(t);
    return new ProjectDtos.TaskResponse(
        t.getId(),
        t.getTitle(),
        t.getStatus(),
        t.getAssignee() == null ? null : t.getAssignee().getId(),
        t.getCreatedAt());
  }

  public List<ProjectDtos.TaskResponse> listTasks(Long projectId, String userEmail) {
    requireMember(projectId, userEmail);
    return tasks.findByProjectIdOrderByCreatedAtDesc(projectId).stream()
        .map(
            t ->
                new ProjectDtos.TaskResponse(
                    t.getId(),
                    t.getTitle(),
                    t.getStatus(),
                    t.getAssignee() == null ? null : t.getAssignee().getId(),
                    t.getCreatedAt()))
        .toList();
  }

  @Transactional
  public ProjectDtos.ContributionResponse addContribution(
      Long projectId, ProjectDtos.AddContributionRequest req, String userEmail) {
    AppUser u = requireMember(projectId, userEmail);
    Project p = projects.findById(projectId).orElseThrow();
    Contribution c = new Contribution();
    c.setProject(p);
    c.setUser(u);
    c.setSummary(req.summary().trim());
    c.setType(req.type() == null || req.type().isBlank() ? "OTHER" : req.type().trim());
    c.setPoints(req.points() == null ? 1 : Math.max(1, req.points()));
    contributions.save(c);
    return new ProjectDtos.ContributionResponse(
        c.getId(), u.getId(), u.getDisplayName(), c.getType(), c.getPoints(), c.getSummary(), c.getCreatedAt());
  }

  public List<ProjectDtos.ContributionResponse> listContributions(Long projectId, String userEmail) {
    requireMember(projectId, userEmail);
    return contributions.findByProjectIdOrderByCreatedAtDesc(projectId).stream()
        .map(
            c ->
                new ProjectDtos.ContributionResponse(
                    c.getId(),
                    c.getUser().getId(),
                    c.getUser().getDisplayName(),
                    c.getType(),
                    c.getPoints(),
                    c.getSummary(),
                    c.getCreatedAt()))
        .toList();
  }

  public List<ProjectDtos.ProjectLeaderboardRow> leaderboard(int limit) {
    List<Object[]> rows = contributions.leaderboardRaw();
    return rows.stream()
        .limit(Math.max(1, Math.min(limit, 50)))
        .map(
            r -> {
              Long pid = ((Number) r[0]).longValue();
              long points = ((Number) r[1]).longValue();
              Project p = projects.findById(pid).orElse(null);
              String title = p == null ? "Unknown" : p.getTitle();
              return new ProjectDtos.ProjectLeaderboardRow(pid, title, points);
            })
        .toList();
  }

  private ProjectDtos.ProjectResponse toProjectResponse(Project p) {
    long total = contributions.totalPoints(p.getId());
    int memberCount = members.findByProjectIdOrderByJoinedAtAsc(p.getId()).size();
    return new ProjectDtos.ProjectResponse(
        p.getId(),
        p.getTitle(),
        p.getDescription(),
        p.getStage(),
        p.getCreatedAt(),
        p.getOwner().getId(),
        p.getOwner().getDisplayName(),
        total,
        memberCount);
  }

  private AppUser requireMember(Long projectId, String userEmail) {
    AppUser u = users.findByEmail(userEmail).orElseThrow();
    if (members.findByProjectIdAndUserId(projectId, u.getId()).isEmpty()) {
      throw new IllegalArgumentException("Must be a project member");
    }
    return u;
  }
}

