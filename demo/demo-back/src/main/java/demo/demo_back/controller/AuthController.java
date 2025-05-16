package demo.demo_back.controller;

import demo.demo_back.domain.User;
import demo.demo_back.dto.LoginRequestDto;
import demo.demo_back.dto.LoginResponseDto;
import demo.demo_back.dto.RegisterRequestDto;
import demo.demo_back.dto.RegisterResponseDto;
import demo.demo_back.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * 회원가입 처리
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequestDto request) {
        if (isInvalidRequest(request.getUserName(), request.getPassword())) {
            return badRequest("user_name 또는 password 필드가 누락되었습니다.");
        }

        try {
            User user = authService.registerUser(request.getUserName(), request.getPassword());
            RegisterResponseDto response = new RegisterResponseDto("회원 가입이 성공적으로 완료되었습니다.", user.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            String errorMessage = e.getMessage();
            if (errorMessage != null && errorMessage.contains("already exists")) {
                return conflict("이미 존재하는 사용자입니다.");
            }
            return serverError("회원 가입 처리 중 오류가 발생했습니다.");
        }
    }

    /**
     * 로그인 처리
     */
    @PostMapping("/session")
    public ResponseEntity<?> login(@RequestBody LoginRequestDto request) {
        if (isInvalidRequest(request.getUserName(), request.getPassword())) {
            return badRequest("user_name 또는 password 필드가 누락되었습니다.");
        }

        try {
            User user = authService.login(request.getUserName(), request.getPassword());
            String token = authService.generateToken(user);

            LoginResponseDto.LoginResponseDataDto dataDto = new LoginResponseDto.LoginResponseDataDto(
                    token,
                    "Bearer",
                    3600, // 예시값
                    new LoginResponseDto.LoginResponseUserDto(user.getId(), user.getUsername())
            );
            LoginResponseDto response = new LoginResponseDto("로그인이 성공적으로 완료되었습니다.", dataDto);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return unauthorized("사용자 이름 또는 비밀번호를 확인해주세요.");
        }
    }

    /**
     * 로그아웃 처리
     */
    @DeleteMapping("/session")
    public ResponseEntity<?> logout(@RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        String token = null;
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            token = authorizationHeader.substring(7);
        }

        if (token == null || token.isEmpty()) {
            return unauthorized("Authorization 헤더에 유효한 토큰이 누락되었습니다.");
        }

        try {
            authService.logout(token);
            Map<String, String> successResponse = new HashMap<>();
            successResponse.put("message", "로그아웃이 성공적으로 완료되었습니다.");
            return ResponseEntity.ok(successResponse);
        } catch (RuntimeException e) {
            return serverError("로그아웃 처리 중 오류가 발생했습니다.");
        }
    }

    // ---------------------
    // 유틸리티 메서드 모음
    // ---------------------

    private boolean isInvalidRequest(String username, String password) {
        return username == null || password == null || username.isEmpty() || password.isEmpty();
    }

    private ResponseEntity<?> badRequest(String detail) {
        return buildErrorResponse("잘못된 요청", detail, HttpStatus.BAD_REQUEST);
    }

    private ResponseEntity<?> conflict(String detail) {
        return buildErrorResponse("회원 가입 실패", detail, HttpStatus.CONFLICT);
    }

    private ResponseEntity<?> unauthorized(String detail) {
        return buildErrorResponse("인증 실패", detail, HttpStatus.UNAUTHORIZED);
    }

    private ResponseEntity<?> serverError(String detail) {
        return buildErrorResponse("서버 오류 발생", detail, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private ResponseEntity<?> buildErrorResponse(String error, String detail, HttpStatus status) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", error);
        errorResponse.put("details", detail);
        return ResponseEntity.status(status).body(errorResponse);
    }
}
