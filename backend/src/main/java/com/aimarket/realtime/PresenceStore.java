package com.aimarket.realtime;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

@Component
public class PresenceStore {
  public record PresenceUser(Long userId, String displayName, Instant joinedAt) {}

  // sessionId -> (projectId, user)
  private final Map<String, SessionPresence> sessions = new ConcurrentHashMap<>();
  // projectId -> (userId -> user)
  private final Map<Long, Map<Long, PresenceUser>> projectUsers = new ConcurrentHashMap<>();

  public record SessionPresence(Long projectId, PresenceUser user) {}

  public void join(String sessionId, Long projectId, PresenceUser user) {
    leave(sessionId);
    sessions.put(sessionId, new SessionPresence(projectId, user));
    projectUsers.computeIfAbsent(projectId, __ -> new ConcurrentHashMap<>()).put(user.userId(), user);
  }

  public SessionPresence leave(String sessionId) {
    SessionPresence sp = sessions.remove(sessionId);
    if (sp == null) return null;
    Map<Long, PresenceUser> users = projectUsers.get(sp.projectId());
    if (users != null) {
      users.remove(sp.user().userId());
      if (users.isEmpty()) {
        projectUsers.remove(sp.projectId());
      }
    }
    return sp;
  }

  public List<PresenceUser> list(Long projectId) {
    Map<Long, PresenceUser> users = projectUsers.get(projectId);
    if (users == null) return List.of();
    List<PresenceUser> list = new ArrayList<>(users.values());
    list.sort(Comparator.comparing(PresenceUser::joinedAt));
    return list;
  }
}

