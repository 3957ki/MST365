package io.jenkins.plugins.steps;

import com.ssafy.core.CoreLogic;
import hudson.model.Run;
import hudson.model.TaskListener;
import io.jenkins.actions.BuildReportAction;
import org.jenkinsci.plugins.workflow.steps.SynchronousNonBlockingStepExecution;
import org.jenkinsci.plugins.workflow.steps.StepContext;

public class CoreLogicStepExecution extends SynchronousNonBlockingStepExecution<Void> {
    private static final long serialVersionUID = 1L;
    private final transient CoreLogicStep step;

    protected CoreLogicStepExecution(CoreLogicStep step, StepContext context) {
        super(context);
        this.step = step;
    }

    @Override
    protected Void run() throws Exception {
        // 1) Pipeline에서 넘어온 input 값
        String input = step.getInput();
        // 2) 현재 빌드 객체에서 빌드 번호 추출
        Run<?, ?> run = getContext().get(Run.class);
        int buildNumber = run.getNumber();

        // 3) CoreLogic 호출 (input과 buildNumber 전달)
        CoreLogic core = new CoreLogic();
        String output = core.process(input, buildNumber);

        // 4) 결과 로깅
        getContext().get(TaskListener.class)
                .getLogger().println("▶ 처리 결과: " + output);

        run.addAction(new BuildReportAction(step.getInput(), output));
        return null;
    }
}
