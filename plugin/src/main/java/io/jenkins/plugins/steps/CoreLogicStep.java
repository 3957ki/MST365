package io.jenkins.plugins.steps;

import hudson.Extension;
import hudson.FilePath;
import hudson.Launcher;
import hudson.model.Run;
import hudson.model.TaskListener;
import hudson.model.Item;
import hudson.security.ACL;
import hudson.util.ListBoxModel;
import org.jenkinsci.Symbol;
import org.jenkinsci.plugins.plaincredentials.FileCredentials;
import org.jenkinsci.plugins.workflow.steps.Step;
import org.jenkinsci.plugins.workflow.steps.StepContext;
import org.jenkinsci.plugins.workflow.steps.StepDescriptor;
import org.jenkinsci.plugins.workflow.steps.StepExecution;
import org.kohsuke.stapler.DataBoundConstructor;
import org.kohsuke.stapler.DataBoundSetter;
import org.kohsuke.stapler.AncestorInPath;

import com.cloudbees.plugins.credentials.common.StandardListBoxModel;
import com.cloudbees.plugins.credentials.CredentialsMatchers;
import com.cloudbees.plugins.credentials.CredentialsProvider;

import java.util.Collections;
import java.util.Set;

public class CoreLogicStep extends Step {
    private final String input;
    /** .env 파일을 저장해 둔 File Credential의 ID */
    private String envFileCredentialsId;
    /** 실행할 포맷 (text | json) */
    private String format;

    @DataBoundConstructor
    public CoreLogicStep(String input) {
        this.input = input;
        this.format = "json"; // 기본값은 json
    }

    public String getInput() {
        return input;
    }

    public String getEnvFileCredentialsId() {
        return envFileCredentialsId;
    }

    @DataBoundSetter
    public void setEnvFileCredentialsId(String envFileCredentialsId) {
        this.envFileCredentialsId = envFileCredentialsId;
    }

    public String getFormat() {
        return format;
    }

    @DataBoundSetter
    public void setFormat(String format) {
        this.format = format;
    }

    @Override
    public StepExecution start(StepContext context) throws Exception {
        return new CoreLogicStepExecution(this, context);
    }

    @Extension
    @Symbol("runMST")
    public static class DescriptorImpl extends StepDescriptor {
        @Override
        public String getFunctionName() {
            return "runMST";
        }

        @Override
        public String getDisplayName() {
            return "Run MST";
        }

        @Override
        public Set<Class<?>> getRequiredContext() {
            return Set.of(Run.class, TaskListener.class, FilePath.class, Launcher.class);
        }
    }
}

