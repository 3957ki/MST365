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
        // 여기가 ContextParameter 대신 getContext() 를 쓰는 부분
        TaskListener listener = getContext().get(TaskListener.class);
        Run<?,?> run = getContext().get(Run.class);

        String result = new CoreLogic().process(step.getInput());
        listener.getLogger().println("CoreLogic output: " + result);
        run.addAction(new BuildReportAction(step.getInput(), result));
        return null;
    }
}
