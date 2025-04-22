package io.jenkins.extensions;

import hudson.Extension;
import hudson.model.Item;
import hudson.model.Job;
import hudson.model.RootAction;
import io.jenkins.actions.BuildReportAction;
import jenkins.model.Jenkins;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Extension
public class GlobalReportAction implements RootAction {
    @Override public String getIconFileName() { return "clipboard.png"; }
    @Override public String getDisplayName()    { return "MCP Reports"; }
    @Override public String getUrlName()        { return "mcp-reports"; }

    public List<BuildEntry> getBuilds() {
        List<BuildEntry> out = new ArrayList<>();
        for (Job<?,?> job : Jenkins.get().getAllItems(Job.class)) {
            job.getBuilds().forEach(run -> {
                BuildReportAction a = run.getAction(BuildReportAction.class);
                if (a != null) {
                    out.add(new BuildEntry(
                            run.getUrl(), run.getDisplayName(), a.getTimestamp()
                    ));
                }
            });
        }
        return out;
    }

    public static class BuildEntry {
        public final String url;
        public final String name;
        public final Date when;
        public BuildEntry(String url, String name, Date when) {
            this.url = url; this.name = name; this.when = when;
        }
    }
}
