package io.jenkins.plugins;

import com.ssafy.core.CoreLogic;
import hudson.FilePath;
import hudson.Launcher;
import hudson.Extension;
import hudson.model.*;
import hudson.tasks.Builder;
import hudson.tasks.BuildStepDescriptor;
import hudson.tasks.BuildStepMonitor;
import hudson.tasks.Publisher;
import jenkins.tasks.SimpleBuildStep;
import org.kohsuke.stapler.DataBoundConstructor;

import java.io.IOException;

public class WrapperBuilder extends Builder implements SimpleBuildStep {
    private final String input;

    @DataBoundConstructor
    public WrapperBuilder(String input) {
        this.input = input;
    }

    @Override
    public void perform(Run<?, ?> run, FilePath workspace, Launcher launcher, TaskListener listener)
            throws InterruptedException {
        CoreLogic logic = new CoreLogic();
        String result = logic.process(input);
        listener.getLogger().println("CoreLogic output: " + result);
    }

    @Override
    public BuildStepMonitor getRequiredMonitorService() {
        return BuildStepMonitor.NONE;
    }

    @Extension
    public static class DescriptorImpl extends BuildStepDescriptor<Builder> {
        public DescriptorImpl() {
            load();
        }

        @Override
        public String getDisplayName() {
            return "Run CoreLogic Wrapper";
        }

        @Override
        public boolean isApplicable(Class<? extends hudson.model.AbstractProject> jobType) {
            // 모든 Freestyle 프로젝트에 적용 가능
            return true;
        }
    }
}