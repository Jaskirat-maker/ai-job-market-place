package com.aimarket.realtime;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class PresenceDisconnectListener {
  private final PresenceStore presence;
  private final PresenceController presenceController;

  public PresenceDisconnectListener(PresenceStore presence, PresenceController presenceController) {
    this.presence = presence;
    this.presenceController = presenceController;
  }

  @EventListener
  public void onDisconnect(SessionDisconnectEvent event) {
    StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
    String sessionId = accessor.getSessionId();
    if (sessionId != null) {
      PresenceStore.SessionPresence sp = presence.leave(sessionId);
      if (sp != null) {
        presenceController.publish(sp.projectId());
      }
    }
  }
}

