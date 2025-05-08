package demo.demo_back.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoardListResponseDto {
    private String message;
    private List<BoardItemDto> data;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BoardItemDto {
        private Long id;
        private Long userId;
        private String title;
        private int view;
        private LocalDateTime createdAt;
    }
} 