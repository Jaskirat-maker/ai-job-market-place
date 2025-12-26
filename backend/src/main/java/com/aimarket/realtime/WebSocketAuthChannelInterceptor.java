package com.aimarket.realtime;

import com.aimarket.auth.JwtService;
import io.jsonwebtoken.Claims;
import java.util.List;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {
  private final JwtService jwtService;

  public WebSocketAuthChannelInterceptor(JwtService jwtService) {
    this.jwtService = jwtService;
  }

  @Override
  public Message<?> preSend(Message<?> message, MessageChannel channel) {
    StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
    if (StompCommand.CONNECT.equals(accessor.getCommand())) {
      String token = headerToken(accessor);
      if (token != null) {
        try {
          Claims claims = jwtService.parseClaims(token);
          if ("access".equals(claims.get("typ", String.class))) {
            String email = claims.getSubject();
            Authentication auth =
                new UsernamePasswordAuthenticationToken(email, null, List.of(() -> "USER"));
            accessor.setUser(auth);
          }
        } catch (Exception ignored) {
        }
      }
    }
    return message;
  }

  private static String headerToken(StompHeaderAccessor accessor) {
    List<String> auth = accessor.getNativeHeader("Authorization");
    if (auth != null && !auth.isEmpty()) {
      String v = auth.get(0);
      if (v != null && v.startsWith("Bearer ")) return v.substring("Bearer ".length());
      return v;
    }
    List<String> x = accessor.getNativeHeader("x-access-token");
    if (x != null && !x.isEmpty()) return x.get(0);
    return null;
  }
}

