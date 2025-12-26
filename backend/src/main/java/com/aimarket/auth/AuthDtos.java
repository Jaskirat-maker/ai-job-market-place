package com.aimarket.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {
  public record RegisterRequest(
      @Email @NotBlank String email,
      @NotBlank @Size(min = 2, max = 100) String displayName,
      @NotBlank @Size(min = 8, max = 72) String password) {}

  public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}

  public record RefreshRequest(@NotBlank String refreshToken) {}

  public record AuthResponse(String accessToken, String refreshToken) {}

  public record MeResponse(Long id, String email, String displayName) {}
}

