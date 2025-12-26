package com.aimarket.realtime;

import com.aimarket.users.AppUser;
import com.aimarket.users.UserRepository;
import java.security.Principal;
import java.time.Instant;
import java.util.List;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class PresenceController {
  private final PresenceStore presence;
  private final UserRepository users;
  private final SimpMessagingTemplate broker;

  public PresenceController(PresenceStore presence, UserRepository users, SimpMessagingTemplate broker) {
    this.presence = presence;
    this.users = users;
    this.broker = broker;
  }

  public record JoinPayload(Long userId) {}

  public record PresenceSnapshot(Long projectId, List<PresenceStore.PresenceUser> users) {}

  @MessageMapping("/projects/{projectId}/presence.join")
  public void join(
      @DestinationVariable Long projectId,
      @Payload(required = false) JoinPayload payload,
      Principal principal,
      SimpMessageHeaderAccessor headers) {
    String sessionId = headers.getSessionId();
    if (sessionId == null) return;

    AppUser u = resolveUser(principal, payload);
    PresenceStore.PresenceUser pu = new PresenceStore.PresenceUser(u.getId(), u.getDisplayName(), Instant.now());
    presence.join(sessionId, projectId, pu);
    publish(projectId);
  }

  private AppUser resolveUser(Principal principal, JoinPayload payload) {
    if (principal != null && principal.getName() != null) {
      return users.findByEmail(principal.getName()).orElseThrow();
    }
    if (payload != null && payload.userId() != null) {
      return users.findById(payload.userId()).orElseThrow();
    }
    throw new IllegalArgumentException("Missing user identity for websocket");
  }

  public void publish(Long projectId) {
    broker.convertAndSend(
        "/topic/projects/" + projectId + "/presence",
        new PresenceSnapshot(projectId, presence.list(projectId)));
  }
}

