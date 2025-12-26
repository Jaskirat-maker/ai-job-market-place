package com.aimarket.projects;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
  @Query(
      """
      select p
      from Project p
      where lower(p.title) like lower(concat('%', :q, '%'))
         or lower(p.description) like lower(concat('%', :q, '%'))
      order by p.createdAt desc
      """)
  List<Project> search(@Param("q") String q, org.springframework.data.domain.Pageable pageable);
}

