package demo.demo_back.controller;

import demo.demo_back.domain.User;
import demo.demo_back.dto.PasswordChangeRequestDto;
import demo.demo_back.dto.UserResponseDto;
import demo.demo_back.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUser(@PathVariable Long userId) {
        try {
            // UserService에서 Optional<User>를 가져옴
            Optional<User> userOptional = userService.getUserById(userId);

            // Optional에 User 객체가 존재하는지 확인
            if (userOptional.isPresent()) {
                // 사용자를 찾았을 경우 (성공)
                User user = userOptional.get(); // Optional에서 User 객체를 가져옴

                // API 명세에 맞는 성공 응답 DTO 구조 생성
                UserResponseDto.UserDataDto data = new UserResponseDto.UserDataDto(
                        user.getId(),
                        user.getUsername(),
                        user.getCreatedAt(),
                        user.getUpdatedAt()
                );
                UserResponseDto response = new UserResponseDto(
                        "사용자 정보가 성공적으로 조회되었습니다.", // 성공 메시지
                        data
                );

                // 200 OK 상태 코드와 함께 응답 본문 반환
                return ResponseEntity.ok(response); // ResponseEntity.status(HttpStatus.OK).body(response); 와 동일

            } else {
                // 사용자를 찾지 못했을 경우 (404 Not Found)
                // API 명세에 맞는 404 에러 응답 본문 생성
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "사용자를 찾을 수 없습니다."); // 명세에 정의된 에러 메시지
                errorResponse.put("details", "요청하신 사용자 ID에 해당하는 사용자가 존재하지 않습니다."); // 명세에 정의된 상세 메시지

                // 404 Not Found 상태 코드와 에러 본문 반환
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }

        } catch (Exception e) {
            // 예상치 못한 서버 오류 발생 시 (500 Internal Server Error)
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "서버 오류 발생");
            errorResponse.put("details", "사용자 정보 조회 중 예상치 못한 오류가 발생했습니다.");
            // TODO: 로깅 추가
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse); // 500 Internal Server Error와 에러 본문 반환
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody PasswordChangeRequestDto request) {
        try {
            // Request validation
            if (request.getCurrentPassword() == null || request.getNewPassword() == null || 
                request.getNewPasswordConfirm() == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "잘못된 요청입니다.");
                errorResponse.put("details", "필수 필드가 누락되었습니다.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            // Password confirmation check
            if (!request.getNewPassword().equals(request.getNewPasswordConfirm())) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "비밀번호 수정 실패");
                errorResponse.put("details", "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            // Get authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User user = (User) authentication.getPrincipal();

            // Change password
            boolean success = userService.changePassword(user.getId(), request.getCurrentPassword(), request.getNewPassword());

            if (success) {
                Map<String, String> successResponse = new HashMap<>();
                successResponse.put("message", "비밀번호가 성공적으로 수정되었습니다.");
                return ResponseEntity.ok(successResponse);
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "비밀번호 수정 실패");
                errorResponse.put("details", "현재 비밀번호가 올바르지 않습니다.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "서버 오류 발생");
            errorResponse.put("details", "비밀번호 수정 중 예상치 못한 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            // 현재 인증된 사용자 정보 가져오기
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User loggedInUser = (User) authentication.getPrincipal();

            // 로그인한 사용자와 삭제 요청 대상이 일치하는지 확인
            if (!loggedInUser.getId().equals(userId)) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "접근 거부");
                errorResponse.put("details", "자신의 계정만 삭제할 수 있습니다.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            // 탈퇴 로직 수행
            userService.deleteUser(userId);

            Map<String, String> successResponse = new HashMap<>();
            successResponse.put("message", "회원 탈퇴가 완료되었습니다.");
            return ResponseEntity.ok(successResponse);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "서버 오류 발생");
            errorResponse.put("details", "회원 탈퇴 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

}