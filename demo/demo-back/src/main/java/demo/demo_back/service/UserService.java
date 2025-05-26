package demo.demo_back.service;

import demo.demo_back.domain.User;

import java.util.Optional;

/**
 * 사용자 관련 서비스 로직 인터페이스
 */
public interface UserService {

    /**
     * 사용자 ID로 사용자 정보 조회
     * @param id 사용자 ID
     * @return Optional<User> (사용자가 없을 수 있음)
     */
    Optional<User> getUserById(Long id);

    /**
     * 사용자 이름으로 사용자 정보 조회
     * @param userName 사용자 이름 (로그인 시 사용)
     * @return Optional<User>
     */
    Optional<User> getUserByUserName(String userName);

    /**
     * 비밀번호 변경
     * @param userId 사용자 ID
     * @param currentPassword 현재 비밀번호
     * @param newPassword 새 비밀번호
     * @return true: 성공, false: 실패
     */
    boolean changePassword(Long userId, String currentPassword, String newPassword);

    /**
     * 회원 탈퇴 (계정 삭제)
     * @param id 사용자 ID
     */
    void deleteUser(Long id);
}
