package io.jenkins.plugins.steps;

import com.ssafy.core.CoreLogic;
import hudson.model.Run;
import hudson.model.TaskListener;
import io.jenkins.actions.BuildReportAction;
import jenkins.model.Jenkins;
import org.jenkinsci.plugins.workflow.steps.SynchronousNonBlockingStepExecution;
import org.jenkinsci.plugins.workflow.steps.StepContext;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

public class CoreLogicStepExecution extends SynchronousNonBlockingStepExecution<Void> {
    private static final long serialVersionUID = 1L;
    private final transient CoreLogicStep step;

    protected CoreLogicStepExecution(CoreLogicStep step, StepContext context) {
        super(context);
        this.step = step;
    }

    @Override
    protected Void run() throws Exception {
        // 1) Pipeline에서 넘어온 input 값(스크립트 파일명)
        String input = step.getInput();

        // 2) Jenkins 홈 아래 "scripts" 디렉터리에서 JSON 파일 로드
        File scriptDir = new File(Jenkins.get().getRootDir(), "scripts");
        String fileName = input.endsWith(".json") ? input : input + ".json";
        File scriptFile = new File(scriptDir, fileName);

        TaskListener listener = getContext().get(TaskListener.class);
        if (scriptFile.exists()) {
            String content = new String(Files.readAllBytes(scriptFile.toPath()), StandardCharsets.UTF_8);
            listener.getLogger().println("▶ 로드된 스크립트 (" + fileName + "):");
            listener.getLogger().println(content);
        } else {
            listener.getLogger().println("▶ 스크립트 파일을 찾을 수 없습니다: " + scriptFile.getAbsolutePath());
        }

        return null;
    }
}

