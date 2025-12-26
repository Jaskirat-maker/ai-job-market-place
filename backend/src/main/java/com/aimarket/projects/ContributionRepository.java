package com.aimarket.projects;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ContributionRepository extends JpaRepository<Contribution, Long> {
  List<Contribution> findByProjectIdOrderByCreatedAtDesc(Long projectId);

  @Query(
      """
      select c.project.id, sum(c.points)
      from Contribution c
      group by c.project.id
      order by sum(c.points) desc
      """)
  List<Object[]> leaderboardRaw();

  @Query(
      """
      select coalesce(sum(c.points), 0)
      from Contribution c
      where c.project.id = :projectId
      """)
  long totalPoints(@Param("projectId") Long projectId);
}

