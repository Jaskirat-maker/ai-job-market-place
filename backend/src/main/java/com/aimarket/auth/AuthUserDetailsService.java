package com.aimarket.auth;

import com.aimarket.users.AppUser;
import com.aimarket.users.UserRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AuthUserDetailsService implements UserDetailsService {
  private final UserRepository users;

  public AuthUserDetailsService(UserRepository users) {
    this.users = users;
  }

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    AppUser u =
        users
            .findByEmail(username.trim().toLowerCase())
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    return User.withUsername(u.getEmail()).password(u.getPasswordHash()).authorities("USER").build();
  }
}

