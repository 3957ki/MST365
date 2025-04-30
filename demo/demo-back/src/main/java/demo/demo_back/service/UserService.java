package demo.demo_back.service;

import demo.demo_back.domain.User;
import java.util.Optional; // 사용자를 찾지 못할 경우를 대비해 Optional 반환 고려

public interface UserService {
    // ID로 사용자 정보 조회 (GET /api/v1/users/{userId} 에 사용)
    Optional<User> getUserById(Long id); // 사용자가 없을 수 있으므로 Optional 반환 고려

    // 사용자 이름으로 사용자 조회 (로그인 시 사용자 정보 검증에 사용될 수 있음)
    Optional<User> getUserByUserName(String userName); // 'email' 대신 'userName' 사용

    // 비밀번호 변경 (POST /api/v1/users/change-password 에 사용)
    // Long userId: 어떤 사용자의 비밀번호를 바꿀지 (인증된 사용자의 ID)
    // String currentPassword: 현재 비밀번호 확인
    // String newPassword: 새 비밀번호
    // boolean: 비밀번호 변경 성공 여부 반환
    boolean changePassword(Long userId, String currentPassword, String newPassword);

    // 현재 명세에 없는 일반 정보 수정 및 삭제 관련 메소드는 제거
    // User registerUser(User user); // 회원가입은 AuthService로 이동
    // User updateUser(Long id, User user); // 일반 수정 API 없음
     void deleteUser(Long id); // 회원 탈퇴 API 없음


}