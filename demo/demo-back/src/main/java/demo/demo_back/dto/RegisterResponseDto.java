package demo.demo_back.dto;

import lombok.AllArgsConstructor; // @AllArgsConstructor 추가
import lombok.Data;
import lombok.NoArgsConstructor; // @NoArgsConstructor 추가

@Data
@NoArgsConstructor // 기본 생성자
@AllArgsConstructor // 모든 필드를 포함하는 생성자
public class RegisterResponseDto {
    private String message; // API 명세에 따른 message 필드
    private Long userId;    // API 명세에 따른 user_id 필드

    // @AllArgsConstructor 사용 시 필드 순서대로 생성자 파라미터가 정해짐
    // 필요에 따라 @Builder 패턴을 사용하여 명확하게 객체 생성 가능
}