package io.jenkins.extensions.dto;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;

public class ScriptModel {
    private String title;
    private List<Scenario> scenarios = new ArrayList<>();

    // **TXT 전용 필드 추가**
    private String content;

    public ScriptModel() { }

    public ScriptModel(String title, List<Scenario> scenarios) {
        this.title = title;
        this.scenarios = scenarios != null ? scenarios : new ArrayList<>();
    }

    // 선택적으로, content 포함 생성자
    public ScriptModel(String title, List<Scenario> scenarios, String content) {
        this.title = title;
        this.scenarios = scenarios != null ? scenarios : new ArrayList<>();
        this.content = content;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<Scenario> getScenarios() {
        return scenarios;
    }

    public void setScenarios(List<Scenario> scenarios) {
        this.scenarios = scenarios;
    }

    // --- content getter/setter 추가 ---
    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public static class Scenario {
        private String title;
        private List<String> steps = new ArrayList<>();

        public Scenario() { }

        public Scenario(String title, List<String> steps) {
            this.title = title;
            this.steps = steps != null ? steps : new ArrayList<>();
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public List<String> getSteps() {
            return steps;
        }

        public void setSteps(List<String> steps) {
            this.steps = steps;
        }
    }

    // JSON → 객체 (scenarios 기반)
    public static ScriptModel fromJson(String json) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(json, ScriptModel.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON 파싱 실패", e);
        }
    }

    // 객체 → JSON (디버깅용, content 포함)
    public String toJson() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper
                    .writerWithDefaultPrettyPrinter()
                    .writeValueAsString(this);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON 직렬화 실패", e);
        }
    }
}
