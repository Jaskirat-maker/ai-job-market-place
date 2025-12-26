package com.aimarket.auth;

import com.aimarket.users.AppUser;
import com.aimarket.users.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final AuthService auth;
  private final UserRepository users;

  public AuthController(AuthService auth, UserRepository users) {
    this.auth = auth;
    this.users = users;
  }

  @PostMapping("/register")
  public ResponseEntity<AuthDtos.AuthResponse> register(@Valid @RequestBody AuthDtos.RegisterRequest req) {
    return ResponseEntity.ok(auth.register(req));
  }

  @PostMapping("/login")
  public ResponseEntity<AuthDtos.AuthResponse> login(@Valid @RequestBody AuthDtos.LoginRequest req) {
    return ResponseEntity.ok(auth.login(req));
  }

  @PostMapping("/refresh")
  public ResponseEntity<AuthDtos.AuthResponse> refresh(@Valid @RequestBody AuthDtos.RefreshRequest req) {
    return ResponseEntity.ok(auth.refresh(req));
  }

  @GetMapping("/me")
  public ResponseEntity<AuthDtos.MeResponse> me(Authentication authentication) {
    String email = authentication.getName();
    AppUser u = users.findByEmail(email).orElseThrow();
    return ResponseEntity.ok(new AuthDtos.MeResponse(u.getId(), u.getEmail(), u.getDisplayName()));
  }
}

