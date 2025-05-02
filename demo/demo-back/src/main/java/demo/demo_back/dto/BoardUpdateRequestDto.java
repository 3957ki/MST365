package demo.demo_back.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoardUpdateRequestDto {
    @Size(max = 200, message = "제목은 200자를 초과할 수 없습니다.")
    private String title;

    private String content;

    // 최소한 하나의 필드는 null이 아니어야 함을 검증
    public boolean isValid() {
        if (title == null && content == null) {
            return false;
        }
        // 빈 문자열이나 공백만 있는 경우도 체크
        if (title != null && title.trim().isEmpty() && 
            (content == null || content.trim().isEmpty())) {
            return false;
        }
        if (content != null && content.trim().isEmpty() && 
            (title == null || title.trim().isEmpty())) {
            return false;
        }
        return true;
    }
} 