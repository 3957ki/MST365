package demo.demo_back.service.impl;

import demo.demo_back.domain.User;
import demo.demo_back.repository.UserRepository;
import demo.demo_back.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * 사용자(User) 관련 서비스 구현체.
 * 사용자 조회, 비밀번호 변경, 탈퇴 등의 기능을 제공합니다.
 */
@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * ID로 사용자 조회
     * @param id 사용자 ID
     * @return Optional<User>
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    /**
     * 사용자 이름으로 조회
     * @param userName 사용자 이름
     * @return Optional<User>
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<User> getUserByUserName(String userName) {
        return userRepository.findByUserName(userName);
    }

    /**
     * 비밀번호 변경
     * @param userId 사용자 ID
     * @param currentPassword 현재 비밀번호
     * @param newPassword 새 비밀번호
     * @return true: 변경 성공, false: 비밀번호 불일치
     */
    @Override
    public boolean changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return false;
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return true;
    }

    /**
     * 회원 탈퇴 (계정 삭제)
     * @param id 사용자 ID
     */
    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
