package demo.demo_back.service;

import demo.demo_back.domain.User;

public interface AuthService {
    // 회원 가입 (POST /api/v1/auth/register 에 사용)
    // User registerUser(User user); // 필드만 받도록 시그니처 변경 고려
    User registerUser(String userName, String password); // API Request Body에 맞춰 필드로 받도록 변경

    // 로그인 (POST /api/v1/auth/session 에 사용)
    // String email 대신 String userName 사용
    User login(String userName, String password);

    // 로그아웃 (DELETE /api/v1/auth/session 에 사용)
    void logout(String token); // 토큰 무효화 처리

    // 토큰 유효성 검증 (인증 미들웨어/필터에서 사용)
    User validateToken(String token); // 유효한 토큰이면 사용자 정보 반환

    // 인증 토큰 생성 (로그인 성공 시 사용)
    String generateToken(User user);
}