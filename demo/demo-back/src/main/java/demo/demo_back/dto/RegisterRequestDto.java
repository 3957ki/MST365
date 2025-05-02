package demo.demo_back.dto;

import com.fasterxml.jackson.annotation.JsonProperty; // 이 임포트 추가
import lombok.Data;

@Data
public class RegisterRequestDto {
    @JsonProperty("user_name") // JSON 키 "user_name"을 이 필드에 매핑
    private String userName;

    // 필드 이름과 JSON 키가 같으므로 @JsonProperty("password")는 생략 가능
    // @JsonProperty("password")
    private String password;
}