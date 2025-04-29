package demo.demo_back.service.impl;

import demo.demo_back.domain.User;
import demo.demo_back.repository.UserRepository;
import demo.demo_back.service.AuthService;
import io.jsonwebtoken.*; // JJWT 임포트
import io.jsonwebtoken.security.Keys; // Keys 임포트 (시크릿 키 생성용)
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value; // Value 임포트 (설정 값 주입용)
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date; // java.util.Date 임포트 (토큰 만료 시간 설정용)
import java.util.HashMap; // 필요 시 임포트
import java.util.Map; // 필요 시 임포트
import java.util.Optional; // Optional 임포트 (findByUserName 반환 타입용)
import java.util.UUID; // 예시 토큰 생성용 (실제 JWT 구현 후 불필요)

import java.security.Key; // Key 임포트 (시크릿 키 타입)
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

     // logger 변수 선언 및 초기화 추가
     private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // 설정 파일에서 JWT 서명에 사용할 시크릿 키 주입
    @Value("${jwt.secret}") // application.properties/yml 에 jwt.secret 속성 추가 필요
    private String secret;

    // JWT 토큰 만료 시간 (밀리초 단위) 주입
    @Value("${jwt.expiration.ms}") // application.properties/yml 에 jwt.expiration.ms 속성 추가 필요
    private long jwtExpirationMs;

    @Autowired
    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User registerUser(String userName, String password) {
        // ... (기존 registerUser 로직 - user.setCreatedAt 라인 제거 필요) ...
        Optional<User> existingUser = userRepository.findByUserName(userName);
        if (existingUser.isPresent()) {
            throw new RuntimeException("Username already exists: " + userName);
        }

        User user = new User();
        user.setUserName(userName);
        user.setPassword(passwordEncoder.encode(password));
        // User Entity의 @PrePersist가 createdAt과 role을 설정해 줌

        return userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public User login(String userName, String password) {
        // ... (기존 login 로직 - passwordEncoder 사용 확인) ...
         User user = userRepository.findByUserName(userName)
                 .orElseThrow(() -> new RuntimeException("User not found with username: " + userName));

         if (!passwordEncoder.matches(password, user.getPassword())) {
             throw new RuntimeException("Invalid password for username: " + userName);
         }

         return user;
    }

    @Override
    public void logout(String token) {
        // TODO: 실제 토큰 무효화 또는 세션 종료 로직 구현 (예: Redis 등에 블랙리스트 관리)
        System.out.println("Logout logic placeholder: Invalidate token " + token);
    }

    @Override
    // 로그인 성공한 User 객체를 기반으로 JWT 토큰 생성
    public String generateToken(User user) {
        // 사용자 ID와 역할(role)을 클레임(claims)에 추가
        Claims claims = Jwts.claims().setSubject(user.getUsername()); // subject에 사용자 이름 또는 ID 사용
        claims.put("userId", user.getId()); // 사용자 ID 클레임 추가
        claims.put("roles", user.getAuthorities()); // 사용자 권한 클레임 추가 (GrantedAuthority 컬렉션)

        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + jwtExpirationMs); // 토큰 만료 시간 설정

        // 시크릿 키 생성 (Base64로 인코딩된 문자열 사용)
        Key signingKey = Keys.hmacShaKeyFor(secret.getBytes()); // 시크릿 키 문자열을 바이트 배열로 변환

        // JWT 토큰 빌드 및 서명
        return Jwts.builder()
                .setClaims(claims) // 클레임 설정
                .setIssuedAt(now) // 발행 시간 설정
                .setExpiration(expirationDate) // 만료 시간 설정
                .signWith(signingKey, SignatureAlgorithm.HS256) // 서명 (시크릿 키와 HS256 알고리즘 사용)
                .compact(); // JWT 문자열로 직렬화
    }

    @Override
    // JWT 토큰 유효성 검증 및 사용자 정보 반환
    public User validateToken(String token) {
        try {
            // 시크릿 키 생성 (검증 시에도 동일한 키 사용)
            Key signingKey = Keys.hmacShaKeyFor(secret.getBytes());

            // JWT 파싱 및 서명 검증, 클레임 추출
            Jws<Claims> claimsJws = Jwts.parserBuilder()
                    .setSigningKey(signingKey) // 서명 검증에 사용할 시크릿 키 설정
                    .build()
                    .parseClaimsJws(token); // 토큰 파싱 및 검증

            // 토큰에서 사용자 ID 클레임 추출
            Claims claims = claimsJws.getBody();
            Long userId = claims.get("userId", Long.class); // 클레임에서 userId 가져옴

            if (userId == null) {
                // 토큰에 사용자 ID 클레임이 없는 경우 (유효하지 않은 토큰)
                return null; // 또는 예외 발생
            }

            // 사용자 ID로 DB에서 User Entity 로드
            Optional<User> userOptional = userRepository.findById(userId);

            if (userOptional.isPresent()) {
                // 사용자가 존재하면 User Entity 반환 (인증 성공)
                return userOptional.get();
            } else {
                // 토큰의 사용자 ID에 해당하는 User가 DB에 없는 경우 (유효하지 않은 토큰)
                return null; // 또는 예외 발생
            }

        } catch (ExpiredJwtException e) {
            // 토큰 만료 예외 처리
            logger.error("JWT token is expired: {}", e.getMessage());
            return null; // 또는 예외 발생
        } catch (UnsupportedJwtException e) {
            // 지원되지 않는 토큰 예외 처리
            logger.error("JWT token is unsupported: {}", e.getMessage());
            return null;
        } catch (MalformedJwtException e) {
            // 잘못된 형식 토큰 예외 처리
            logger.error("Invalid JWT token: {}", e.getMessage());
            return null;
        } catch (SignatureException e) {
            // 서명 검증 실패 예외 처리
            logger.error("Invalid JWT signature: {}", e.getMessage());
            return null;
        } catch (IllegalArgumentException e) {
            // 잘못된 인자 예외 처리 (예: 빈 문자열 토큰)
            logger.error("JWT token compact of handler are invalid: {}", e.getMessage());
            return null;
        } catch (Exception e) {
            // 예상치 못한 다른 예외 처리
            logger.error("An error occurred while validating JWT token", e);
            return null;
        }
        // 토큰이 유효하지 않으면 null 반환 또는 예외 발생
        // return null;
    }

    // 예시 토큰 생성 메소드는 이제 필요 없으므로 제거
    // @Override
    // public String generateToken(User user) { return UUID.randomUUID().toString(); }
}