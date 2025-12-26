package com.aimarket.projects;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
  @Query(
      value =
          """
          select p.*
          from projects p
          where lower(p.title) like lower(concat('%', :q, '%'))
             or lower(p.description) like lower(concat('%', :q, '%'))
          order by p.created_at desc
          limit :limit
          """,
      nativeQuery = true)
  List<Project> search(@Param("q") String q, @Param("limit") int limit);
}

