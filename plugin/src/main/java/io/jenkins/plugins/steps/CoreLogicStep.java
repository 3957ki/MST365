package io.jenkins.plugins.steps;

import hudson.Extension;
import hudson.FilePath;
import hudson.Launcher;
import hudson.model.Run;
import hudson.model.TaskListener;
import org.jenkinsci.Symbol;
import org.jenkinsci.plugins.workflow.steps.*;
import org.kohsuke.stapler.DataBoundConstructor;
import java.util.Set;

public class CoreLogicStep extends Step {
    private final String input;

    @DataBoundConstructor
    public CoreLogicStep(String input) {
        this.input = input;
    }
    public String getInput() {
        return input;
    }

    @Override
    public StepExecution start(StepContext context) throws Exception {
        return new CoreLogicStepExecution(this, context);
    }

    @Extension
    @Symbol("runCoreLogic")
    public static class DescriptorImpl extends StepDescriptor {
        @Override public String getFunctionName() { return "runCoreLogic"; }
        @Override public String getDisplayName()   { return "Run CoreLogic"; }
        @Override public Set<Class<?>> getRequiredContext() {
            return Set.of(Run.class, TaskListener.class, FilePath.class, Launcher.class);
        }
    }
}
