package io.jenkins.actions;

import hudson.model.Run;
import org.jenkinsci.plugins.workflow.steps.StepContext;
import org.kohsuke.stapler.DataBoundConstructor;
import jenkins.model.RunAction2;
import java.time.Instant;

public class BuildReportAction implements RunAction2 {
    private transient Run<?,?> run;
    private final String scriptPath;
    private final String status;
    private final Instant timestamp;

    @DataBoundConstructor
    public BuildReportAction(String scriptPath, String status) {
        this.scriptPath = scriptPath;
        this.status     = status;
        this.timestamp  = Instant.now();
    }

    public String getScriptPath() { return scriptPath; }
    public String getStatus()     { return status; }
    public Instant getTimestamp(){ return timestamp; }

    @Override
    public String getIconFileName() { return null; }      // 숨겨진 액션
    @Override
    public String getDisplayName()   { return null; }
    @Override
    public String getUrlName()       { return "mcp-report"; }

    @Override
    public void onAttached(Run<?,?> r) { this.run = r; }
    @Override
    public void onLoad(Run<?,?> r)     { this.run = r; }
}