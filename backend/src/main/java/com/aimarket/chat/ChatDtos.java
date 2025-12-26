package com.aimarket.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public class ChatDtos {
  public record SendChatMessageRequest(
      @NotBlank @Size(min = 1, max = 2000) String content) {}

  public record ChatMessageResponse(
      Long id, Long projectId, Long senderId, String senderName, String content, Instant createdAt) {}
}

