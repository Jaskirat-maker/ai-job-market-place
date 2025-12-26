package com.aimarket.chat;

import com.aimarket.projects.ProjectMemberRepository;
import com.aimarket.users.AppUser;
import com.aimarket.users.UserRepository;
import java.security.Principal;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projects/{projectId}/chat")
public class ChatHistoryController {
  private final ChatMessageRepository messages;
  private final UserRepository users;
  private final ProjectMemberRepository members;

  public ChatHistoryController(ChatMessageRepository messages, UserRepository users, ProjectMemberRepository members) {
    this.messages = messages;
    this.users = users;
    this.members = members;
  }

  @GetMapping
  public List<ChatDtos.ChatMessageResponse> recent(@PathVariable Long projectId, Principal principal) {
    AppUser u = users.findByEmail(principal.getName()).orElseThrow();
    if (members.findByProjectIdAndUserId(projectId, u.getId()).isEmpty()) {
      throw new IllegalArgumentException("Must be a project member to view chat");
    }
    return messages.findTop50ByProjectIdOrderByCreatedAtDesc(projectId).stream()
        .map(
            m ->
                new ChatDtos.ChatMessageResponse(
                    m.getId(),
                    m.getProject().getId(),
                    m.getSender().getId(),
                    m.getSender().getDisplayName(),
                    m.getContent(),
                    m.getCreatedAt()))
        .toList();
  }
}

