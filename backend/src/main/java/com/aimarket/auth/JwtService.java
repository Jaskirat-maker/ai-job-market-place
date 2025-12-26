package com.aimarket.auth;

import com.aimarket.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  private final JwtProperties props;
  private final Key key;

  public JwtService(JwtProperties props) {
    this.props = props;
    // secret is base64-ish? accept raw by base64-encoding if needed
    byte[] bytes;
    try {
      bytes = Decoders.BASE64.decode(props.getSecret());
    } catch (IllegalArgumentException e) {
      bytes = props.getSecret().getBytes();
    }
    this.key = Keys.hmacShaKeyFor(normalize(bytes));
  }

  private static byte[] normalize(byte[] bytes) {
    // jjwt requires minimum key size; pad if user gave short dev secret
    if (bytes.length >= 32) return bytes;
    byte[] padded = new byte[32];
    for (int i = 0; i < padded.length; i++) {
      padded[i] = bytes[i % bytes.length];
    }
    return padded;
  }

  public String createAccessToken(Long userId, String email) {
    Instant now = Instant.now();
    Instant exp = now.plus(props.getAccessTokenMinutes(), ChronoUnit.MINUTES);
    return Jwts.builder()
        .setSubject(email)
        .setIssuedAt(Date.from(now))
        .setExpiration(Date.from(exp))
        .addClaims(Map.of("uid", userId, "typ", "access"))
        .signWith(key, SignatureAlgorithm.HS256)
        .compact();
  }

  public String createRefreshToken(Long userId, String email) {
    Instant now = Instant.now();
    Instant exp = now.plus(props.getRefreshTokenDays(), ChronoUnit.DAYS);
    return Jwts.builder()
        .setSubject(email)
        .setIssuedAt(Date.from(now))
        .setExpiration(Date.from(exp))
        .addClaims(Map.of("uid", userId, "typ", "refresh"))
        .signWith(key, SignatureAlgorithm.HS256)
        .compact();
  }

  public Claims parseClaims(String jwt) {
    return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(jwt).getBody();
  }

  public boolean isRefreshToken(Claims claims) {
    return "refresh".equals(claims.get("typ", String.class));
  }

  public Long userId(Claims claims) {
    Object v = claims.get("uid");
    if (v instanceof Integer i) return i.longValue();
    if (v instanceof Long l) return l;
    if (v instanceof String s) return Long.parseLong(s);
    return null;
  }
}

