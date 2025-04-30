package demo.demo_back.dto;

import com.fasterxml.jackson.annotation.JsonProperty; // 이 임포트 추가
import lombok.Data;

@Data
public class LoginRequestDto {
    @JsonProperty("user_name") // JSON 키 "user_name"을 이 필드에 매핑
    private String userName;

    @JsonProperty("password") // JSON 키 "password"를 이 필드에 매핑 (생략 가능하지만 명확성 위해 추가)
    private String password;
}