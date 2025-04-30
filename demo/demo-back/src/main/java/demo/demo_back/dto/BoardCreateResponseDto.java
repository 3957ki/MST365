package demo.demo_back.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoardCreateResponseDto {
    private String message;
    private BoardDataDto data;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BoardDataDto {
        private Long id;
        private String title;
        private String content;
        private Long userId;
        private String userName;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
} 