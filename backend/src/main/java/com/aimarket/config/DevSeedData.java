package com.aimarket.config;

import com.aimarket.projects.Contribution;
import com.aimarket.projects.ContributionRepository;
import com.aimarket.projects.Project;
import com.aimarket.projects.ProjectMember;
import com.aimarket.projects.ProjectMemberRepository;
import com.aimarket.projects.ProjectRepository;
import com.aimarket.users.AppUser;
import com.aimarket.users.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DevSeedData {
  @Bean
  CommandLineRunner seed(
      UserRepository users,
      ProjectRepository projects,
      ProjectMemberRepository members,
      ContributionRepository contributions,
      PasswordEncoder encoder) {
    return args -> {
      if (users.count() > 0 || projects.count() > 0) return;

      AppUser a = new AppUser();
      a.setEmail("alice@example.com");
      a.setDisplayName("Alice");
      a.setPasswordHash(encoder.encode("password123"));
      users.save(a);

      AppUser b = new AppUser();
      b.setEmail("bob@example.com");
      b.setDisplayName("Bob");
      b.setPasswordHash(encoder.encode("password123"));
      users.save(b);

      Project p1 = new Project();
      p1.setTitle("AI Resume Reviewer");
      p1.setDescription("A tool that gives resume feedback and matches candidates to roles.");
      p1.setStage("mvp");
      p1.setOwner(a);
      projects.save(p1);

      ProjectMember m1 = new ProjectMember();
      m1.setProject(p1);
      m1.setUser(a);
      m1.setRole("OWNER");
      members.save(m1);

      ProjectMember m2 = new ProjectMember();
      m2.setProject(p1);
      m2.setUser(b);
      m2.setRole("MEMBER");
      members.save(m2);

      Contribution c1 = new Contribution();
      c1.setProject(p1);
      c1.setUser(a);
      c1.setType("DOCS");
      c1.setPoints(3);
      c1.setSummary("Wrote contribution guide and onboarding docs.");
      contributions.save(c1);

      Contribution c2 = new Contribution();
      c2.setProject(p1);
      c2.setUser(b);
      c2.setType("TASK_DONE");
      c2.setPoints(5);
      c2.setSummary("Implemented project search + filters.");
      contributions.save(c2);

      Project p2 = new Project();
      p2.setTitle("Team Finder Platform");
      p2.setDescription("Find teammates by skills and collaborate in real time.");
      p2.setStage("idea");
      p2.setOwner(b);
      projects.save(p2);

      ProjectMember m3 = new ProjectMember();
      m3.setProject(p2);
      m3.setUser(b);
      m3.setRole("OWNER");
      members.save(m3);
    };
  }
}

