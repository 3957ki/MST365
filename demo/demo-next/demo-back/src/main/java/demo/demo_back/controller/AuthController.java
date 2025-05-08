package demo.demo_back.controller;

import demo.demo_back.domain.User;
import demo.demo_back.dto.LoginRequestDto;
import demo.demo_back.dto.LoginResponseDto;
import demo.demo_back.dto.RegisterRequestDto;
import demo.demo_back.dto.RegisterResponseDto; // 수정된 DTO 임포트
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

    // 회원 가입 (POST /api/v1/auth/register)
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequestDto request) {
        try {
            // 요청 본문 유효성 검사 (필수 필드 누락 등) - @Valid 어노테이션과 함께 구현될 부분
            if (request.getUserName() == null || request.getPassword() == null || request.getUserName().isEmpty() || request.getPassword().isEmpty()) {
                 Map<String, String> errorResponse = new HashMap<>();
                 errorResponse.put("error", "잘못된 요청입니다.");
                 errorResponse.put("details", "user_name 또는 password 필드가 누락되었습니다.");
                 return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse); // 400 Bad Request (명세)
            }
            // TODO: 비밀번호 정책 검사 등 추가 유효성 검사

            // AuthService 호출
            User user = authService.registerUser(request.getUserName(), request.getPassword());

            // API 명세에 맞는 성공 응답 DTO 생성 및 반환 (201 Created)
            // RegisterResponseDto는 message와 userId 필드를 가집니다. (이전 답변에서 수정된 DTO 사용)
            RegisterResponseDto responseBody = new RegisterResponseDto("회원 가입이 성공적으로 완료되었습니다.", user.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(responseBody);

        } catch (RuntimeException e) {
            // Service에서 발생한 예외 처리 및 명세에 맞는 실패 응답 반환
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "회원 가입 실패");
            // Service에서 던진 예외 메시지를 기반으로 상세 메시지 및 상태 코드 결정
            String errorMessage = e.getMessage();
            errorResponse.put("details", errorMessage);

            if (errorMessage != null && errorMessage.contains("already exists")) { // AuthService에서 "Username already exists" 메시지를 던진 경우
                return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse); // 409 Conflict (명세)
            } else {
                 // 예상치 못한 다른 오류는 500 Internal Server Error로 처리
                 // TODO: 로깅 추가
                 errorResponse.put("error", "서버 오류 발생");
                 errorResponse.put("details", "회원 가입 처리 중 예상치 못한 오류가 발생했습니다.");
                 return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse); // 500 Internal Server Error (명세)
            }
        }
    }

    // 로그인 (POST /api/v1/auth/session)
    @PostMapping("/session")
    public ResponseEntity<?> login(@RequestBody LoginRequestDto request) {
        try {
            // 요청 본문 유효성 검사
             if (request.getUserName() == null || request.getPassword() == null || request.getUserName().isEmpty() || request.getPassword().isEmpty()) {
                 Map<String, String> errorResponse = new HashMap<>();
                 errorResponse.put("error", "잘못된 요청 형식입니다.");
                 errorResponse.put("details", "user_name 또는 password 필드가 누락되었습니다.");
                 return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse); // 400 Bad Request (명세)
             }

            // AuthService 호출 (사용자 인증 및 정보 가져오기)
            User user = authService.login(request.getUserName(), request.getPassword()); // 사용자 없거나 비번 틀리면 예외 발생

            // AuthService 호출 (인증 성공 시 토кен 생성) - 현재 placeholder
            String token = authService.generateToken(user);
            // TODO: 실제 토큰 유효 시간 등을 generateToken 메소드에서 받아오도록 수정 필요

            // API 명세에 맞는 성공 응답 DTO 구조 생성 및 반환 (200 OK)
            // LoginResponseDto는 message와 data (nested 객체) 필드를 가집니다. (이전 답변에서 수정된 DTO 사용)
            LoginResponseDto.LoginResponseDataDto dataDto = new LoginResponseDto.LoginResponseDataDto(
                    token, // access_token 필드
                    "Bearer", // token_type 필드 (일반적으로 Bearer)
                    3600, // expires_in 필드 (예시값, 실제 토큰 만료 시간)
                    new LoginResponseDto.LoginResponseUserDto(user.getId(), user.getUsername()) // user (nested 객체)
            );
            LoginResponseDto responseBody = new LoginResponseDto("로그인이 성공적으로 완료되었습니다.", dataDto);

            return ResponseEntity.ok(responseBody); // 200 OK

        } catch (RuntimeException e) {
            // Service에서 발생한 예외 처리 및 명세에 맞는 실패 응답 반환 (401 Unauthorized)
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "로그인 정보가 올바르지 않습니다.");
            errorResponse.put("details", "사용자 이름 또는 비밀번호를 확인해주세요."); // 명세에 정의된 상세 메시지 사용

            // AuthService.login에서 사용자 없거나 비밀번호 불일치 시 동일한 예외 메시지를 던진다면 이 로직으로 처리 가능
            // 예외 메시지에 따라 더 상세한 details 제공도 가능
            // if (e.getMessage() != null && e.getMessage().contains("User not found")) { ... }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse); // 401 Unauthorized (명세)

            // 예상치 못한 다른 오류는 500 Internal Server Error로 처리하는 것이 더 적절할 수 있습니다.
            // @ExceptionHandler를 사용하면 더 체계적인 에러 처리가 가능합니다.
        }
    }

    // 로그아웃 (DELETE /api/v1/auth/session)
    // HTTP Header의 Authorization: Bearer <token> 에서 토큰 추출
    @DeleteMapping("/session")
    public ResponseEntity<?> logout(@RequestHeader(name = "Authorization", required = false) String authorizationHeader) { // required = false로 설정하여 헤더가 없을 경우 null 처리
        try {
            // "Bearer " 접두사 제거 (실제 토큰만 추출)
            String token = null;
            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                token = authorizationHeader.substring(7);
            }

            if (token == null || token.isEmpty()) {
                 // 토큰이 없거나 비어있으면 401 Unauthorized 반환 (인증 필터에서 처리될 수도 있지만 여기서도 가능)
                 Map<String, String> errorResponse = new HashMap<>();
                 errorResponse.put("error", "인증 실패");
                 errorResponse.put("details", "Authorization 헤더에 유효한 토큰이 누락되었습니다."); // 명세에 정의된 상세 메시지 사용
                 return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse); // 401 Unauthorized (명세)
            }

            // AuthService 호출 (토큰 무효화) - 현재 placeholder
            authService.logout(token); // 유효하지 않은 토큰이면 Service에서 예외를 던질 수 있음

            // API 명세에 맞는 성공 응답 본문 생성 ({ "message": "..." })
            Map<String, String> successResponse = new HashMap<>();
            successResponse.put("message", "로그아웃이 성공적으로 완료되었습니다.");

            // 200 OK 상태 코드와 함께 응답 본문 반환
            return ResponseEntity.ok(successResponse); // 200 OK

        } catch (RuntimeException e) {
            // Service에서 발생한 예외 처리 및 명세에 맞는 실패 응답 반환
            // 예: 유효하지 않은 토큰 처리 중 예외 발생 등 (인증 필터에서 처리될 수도 있지만 여기서도 가능)
            Map<String, String> errorResponse = new HashMap<>();
             errorResponse.put("error", "로그아웃 실패");
             errorResponse.put("details", "로그아웃 처리 중 오류가 발생했습니다."); // 명세에 정의된 상세 메시지 사용

            // TODO: 예외 종류에 따라 401 또는 500 등으로 분기 처리 필요
            // 예: if (e.getMessage() != null && e.getMessage().contains("Invalid token")) { ... return 401 }
            // 예상치 못한 다른 오류는 500
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse); // 500 Internal Server Error (명세)
        }
    }

    // 참고: @ControllerAdvice와 @ExceptionHandler를 사용하여
    // Controller 메소드 내 중복되는 try-catch 블록을 줄이고
    // 예외 처리 로직을 한 곳에서 관리하는 것이 일반적입니다.
}