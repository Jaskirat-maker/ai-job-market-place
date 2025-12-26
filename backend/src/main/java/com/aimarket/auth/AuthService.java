package com.aimarket.auth;

import com.aimarket.users.AppUser;
import com.aimarket.users.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.transaction.Transactional;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
  private final UserRepository users;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthService(UserRepository users, PasswordEncoder passwordEncoder, JwtService jwtService) {
    this.users = users;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }

  @Transactional
  public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest req) {
    String email = req.email().trim().toLowerCase();
    if (users.existsByEmail(email)) {
      throw new IllegalArgumentException("Email already registered");
    }
    AppUser u = new AppUser();
    u.setEmail(email);
    u.setDisplayName(req.displayName().trim());
    u.setPasswordHash(passwordEncoder.encode(req.password()));
    users.save(u);
    return tokens(u);
  }

  public AuthDtos.AuthResponse login(AuthDtos.LoginRequest req) {
    String email = req.email().trim().toLowerCase();
    AppUser u =
        users.findByEmail(email).orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
    if (!passwordEncoder.matches(req.password(), u.getPasswordHash())) {
      throw new BadCredentialsException("Invalid credentials");
    }
    return tokens(u);
  }

  public AuthDtos.AuthResponse refresh(AuthDtos.RefreshRequest req) {
    Claims claims = jwtService.parseClaims(req.refreshToken());
    if (!jwtService.isRefreshToken(claims)) {
      throw new BadCredentialsException("Not a refresh token");
    }
    String email = claims.getSubject();
    AppUser u =
        users.findByEmail(email).orElseThrow(() -> new BadCredentialsException("Invalid token"));
    return tokens(u);
  }

  private AuthDtos.AuthResponse tokens(AppUser u) {
    String access = jwtService.createAccessToken(u.getId(), u.getEmail());
    String refresh = jwtService.createRefreshToken(u.getId(), u.getEmail());
    return new AuthDtos.AuthResponse(access, refresh);
  }
}

