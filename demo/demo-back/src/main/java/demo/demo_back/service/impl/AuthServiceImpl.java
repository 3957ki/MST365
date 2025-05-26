package demo.demo_back.service.impl;

import demo.demo_back.domain.User;
import demo.demo_back.repository.UserRepository;
import demo.demo_back.service.AuthService;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.security.Key;
import java.util.Date;
import java.util.Map;
import java.util.Optional;
import java.util.List;

/**
 * 인증 서비스 구현체.
 * 회원가입, 로그인, 로그아웃, JWT 토큰 생성 및 검증 등의 기능을 제공합니다.
 */
@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration.ms}")
    private long jwtExpirationMs;

    @Autowired
    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * 사용자 회원가입 처리
     */
    @Override
    public User registerUser(String userName, String password) {
        Optional<User> existingUser = userRepository.findByUserName(userName);
        if (existingUser.isPresent()) {
            throw new RuntimeException("Username already exists: " + userName);
        }

        User user = new User();
        user.setUserName(userName);
        user.setPassword(passwordEncoder.encode(password));
        return userRepository.save(user);
    }

    /**
     * 사용자 로그인 처리
     */
    @Override
    @Transactional(readOnly = true)
    public User login(String userName, String password) {
        User user = userRepository.findByUserName(userName)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + userName));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password for username: " + userName);
        }

        return user;
    }

    /**
     * 로그아웃 (토큰 무효화는 실제 구현 필요)
     */
    @Override
    public void logout(String token) {
        logger.info("Logout logic placeholder: Invalidate token {}", token);
    }

    /**
     * JWT 토큰 생성
     */
    @Override
    public String generateToken(User user) {
        Claims claims = Jwts.claims().setSubject(user.getUsername());
        claims.put("userId", user.getId());
        claims.put("roles", user.getAuthorities());

        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + jwtExpirationMs);

        Key signingKey = Keys.hmacShaKeyFor(secret.getBytes());

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(expirationDate)
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * JWT 토큰 유효성 검증 및 사용자 반환
     */
    @Override
    public User validateToken(String token) {
        try {
            Key signingKey = Keys.hmacShaKeyFor(secret.getBytes());

            Jws<Claims> claimsJws = Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(token);

            Claims claims = claimsJws.getBody();
            Long userId = claims.get("userId", Long.class);
            if (userId == null) return null;

            Optional<User> userOptional = userRepository.findById(userId);
            if (userOptional.isEmpty()) return null;

            User user = userOptional.get();
            List<?> roles = claims.get("roles", List.class);
            if (roles != null && !roles.isEmpty()) {
                Object authority = ((Map<?, ?>) roles.get(0)).get("authority");
                if (authority instanceof String roleStr) {
                    user.setRole(roleStr);
                }
            }

            return user;

        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (SignatureException e) {
            logger.error("Invalid JWT signature: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT token compact of handler are invalid: {}", e.getMessage());
        } catch (Exception e) {
            logger.error("An error occurred while validating JWT token", e);
        }
        return null;
    }
}
