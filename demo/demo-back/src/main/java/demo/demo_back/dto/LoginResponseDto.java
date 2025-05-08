package demo.demo_back.dto;

import lombok.AllArgsConstructor; // @AllArgsConstructor 추가
import lombok.Data;
import lombok.NoArgsConstructor; // @NoArgsConstructor 추가

@Data
@NoArgsConstructor // 기본 생성자
@AllArgsConstructor // 모든 필드를 포함하는 생성자
public class LoginResponseDto {
    private String message; // API 명세에 따른 message 필드
    private LoginResponseDataDto data; // API 명세에 따른 data 객체


    // API 명세의 data 객체 구조를 위한 중첩 DTO
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginResponseDataDto { // static nested class로 선언
        private String accessToken; // API 명세에 따른 access_token 필드
        private String tokenType;   // API 명세에 따른 token_type 필드 (예: "Bearer")
        private Integer expiresIn;  // API 명세에 따른 expires_in 필드 (초 단위)
        private LoginResponseUserDto user; // API 명세에 따른 user 객체
    }

    // API 명세의 data.user 객체 구조를 위한 중첩 DTO
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginResponseUserDto { // static nested class로 선언
        private Long id;         // API 명세에 따른 user.id 필드
        private String userName; // API 명세에 따른 user.user_name 필드
    }
}