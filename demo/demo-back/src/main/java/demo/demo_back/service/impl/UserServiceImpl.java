package demo.demo_back.service.impl;

import demo.demo_back.domain.User;
import demo.demo_back.repository.UserRepository;
import demo.demo_back.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service // Spring Bean으로 등록
@Transactional // 클래스 레벨 트랜잭션 설정
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository; // UserRepository 의존성 주입
    private final PasswordEncoder passwordEncoder; // PasswordEncoder 의존성 주입

    @Autowired // 생성자 주입
    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true) // 읽기 전용 트랜잭션
    // ID로 사용자 정보 조회 (GET /api/v1/users/{userId} 에 사용)
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id); // JpaRepository의 findById 메소드 사용
    }

    @Override
    @Transactional(readOnly = true) // 읽기 전용 트랜잭션
    // 사용자 이름으로 사용자 조회 (로그인 시 사용자 정보 검증 등에 사용)
    public Optional<User> getUserByUserName(String userName) {
        // UserRepository에 선언된 findByUserName 커스텀 메소드 사용
        return userRepository.findByUserName(userName);
    }

    @Override
    // 비밀번호 변경 (POST /api/v1/users/change-password 에 사용)
    // 트랜잭션 내에서 사용자 정보를 조회하고 업데이트합니다.
    public boolean changePassword(Long userId, String currentPassword, String newPassword) {
        // 1. ID로 사용자 조회
        // 사용자를 찾지 못하면 예외 발생 (Controller에서 404 등으로 처리)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId)); // 예외 메시지 상세화

        // 2. 현재 비밀번호 검증
        // 입력받은 현재 비밀번호와 DB에 저장된(해싱된) 비밀번호 일치 여부 확인
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return false; // 비밀번호 불일치 시 false 반환 (Controller에서 400 Bad Request 등으로 처리될 수 있음)
        }

        // 3. 새 비밀번호 해싱 및 업데이트
        // 입력받은 새 비밀번호를 해싱하여 User 엔티티에 설정
        user.setPassword(passwordEncoder.encode(newPassword));

        // 4. 사용자 정보 저장 (업데이트)
        // @Transactional 어노테이션으로 인해 메소드 종료 시 변경 내용이 DB에 반영됩니다.
        userRepository.save(user);

        return true; // 비밀번호 변경 성공
    }

    // ERD 및 API 명세에 없는 registerUser, updateUser, deleteUser 메소드는 제거됨
}