package com.aimarket.projects;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<TaskItem, Long> {
  List<TaskItem> findByProjectIdOrderByCreatedAtDesc(Long projectId);
}

