package com.aimarket.chat;

import com.aimarket.projects.Project;
import com.aimarket.projects.ProjectMemberRepository;
import com.aimarket.projects.ProjectRepository;
import com.aimarket.users.AppUser;
import com.aimarket.users.UserRepository;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Controller
public class ChatController {
  private final SimpMessagingTemplate broker;
  private final ChatMessageRepository messages;
  private final ProjectRepository projects;
  private final UserRepository users;
  private final ProjectMemberRepository members;

  public ChatController(
      SimpMessagingTemplate broker,
      ChatMessageRepository messages,
      ProjectRepository projects,
      UserRepository users,
      ProjectMemberRepository members) {
    this.broker = broker;
    this.messages = messages;
    this.projects = projects;
    this.users = users;
    this.members = members;
  }

  @MessageMapping("/projects/{projectId}/chat.send")
  public void send(
      @DestinationVariable Long projectId,
      @Valid ChatDtos.SendChatMessageRequest req,
      Principal principal) {
    if (principal == null) throw new IllegalArgumentException("Not authenticated");
    AppUser sender = users.findByEmail(principal.getName()).orElseThrow();
    if (members.findByProjectIdAndUserId(projectId, sender.getId()).isEmpty()) {
      throw new IllegalArgumentException("Must be a project member to chat");
    }
    Project project = projects.findById(projectId).orElseThrow();

    ChatMessage m = new ChatMessage();
    m.setProject(project);
    m.setSender(sender);
    m.setContent(req.content().trim());
    messages.save(m);

    broker.convertAndSend("/topic/projects/" + projectId + "/chat", toDto(m));
  }

  private ChatDtos.ChatMessageResponse toDto(ChatMessage m) {
    return new ChatDtos.ChatMessageResponse(
        m.getId(),
        m.getProject().getId(),
        m.getSender().getId(),
        m.getSender().getDisplayName(),
        m.getContent(),
        m.getCreatedAt());
  }
}

