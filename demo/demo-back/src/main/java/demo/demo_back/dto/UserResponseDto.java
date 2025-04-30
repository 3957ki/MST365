package demo.demo_back.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDto {
    private String message;
    private UserDataDto data;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDataDto {
        private Long id;
        private String userName;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
} 