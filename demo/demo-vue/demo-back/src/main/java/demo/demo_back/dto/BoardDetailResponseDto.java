package demo.demo_back.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoardDetailResponseDto {
    private String message;
    private BoardDetailDto data;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BoardDetailDto {
        private Long id;
        private Long userId;
        private String title;
        private String content;
        private int view;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private boolean isDeleted;
        private LocalDateTime deletedAt;
    }
} 