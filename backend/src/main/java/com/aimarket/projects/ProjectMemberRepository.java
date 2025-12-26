package com.aimarket.projects;

import com.aimarket.users.AppUser;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
  Optional<ProjectMember> findByProjectIdAndUserId(Long projectId, Long userId);

  List<ProjectMember> findByProjectIdOrderByJoinedAtAsc(Long projectId);

  @Query(
      """
      select pm
      from ProjectMember pm
      join fetch pm.user u
      where pm.project.id = :projectId
      order by pm.joinedAt asc
      """)
  List<ProjectMember> listMembersWithUser(@Param("projectId") Long projectId);

  @Query(
      """
      select pm.project.id
      from ProjectMember pm
      where pm.user = :user
      """)
  List<Long> listProjectIdsForUser(@Param("user") AppUser user);
}

