package demo.demo_back.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoardCreateRequestDto {
    @JsonProperty("title")
    private String title;

    @JsonProperty("content")
    private String content;
} 