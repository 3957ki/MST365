package io.jenkins.extensions;

import hudson.Extension;
import hudson.model.Job;
import hudson.model.RootAction;
import jenkins.model.Jenkins;
import io.jenkins.actions.BuildReportAction;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
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
                            run.getUrl(),       // job URL (e.g. "job/my-job/15/")
                            run.getNumber(),    // 빌드 넘버
                            run.getDisplayName(),
                            a.getTimestamp()
                    ));
                }
            });
        }
        return out;
    }

    /**
     * buildNo에 대응하는 리포트 파일을 읽어서
     * 문자열로 리턴합니다.
     */
    public String getReportContent(int buildNo) throws IOException {
        File home = Jenkins.get().getRootDir();
        File report = new File(home, "mcp_report/result" + buildNo + ".txt");
        if (!report.exists()) {
            return "Report file not found for build " + buildNo;
        }
        return Files.readString(report.toPath());
    }

    public static class BuildEntry {
        public final String url;
        public final int    number;
        public final String name;
        public final Date   when;
        public BuildEntry(String url, int number, String name, Date when) {
            this.url    = url;
            this.number = number;
            this.name   = name;
            this.when   = when;
        }
    }
}
