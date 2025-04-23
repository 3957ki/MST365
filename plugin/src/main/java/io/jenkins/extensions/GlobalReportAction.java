package io.jenkins.extensions;

import hudson.Extension;
import hudson.model.Job;
import hudson.model.RootAction;
import jenkins.model.Jenkins;
import io.jenkins.actions.BuildReportAction;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;

@Extension
public class GlobalReportAction implements RootAction {
    @Override public String getIconFileName() { return "clipboard.png"; }
    @Override public String getDisplayName()    { return "MCP Reports"; }
    @Override public String getUrlName()        { return "mcp-reports"; }

    /**
     * 빌드에 붙은 BuildReportAction을 기준으로 리스트 생성
     */
    public List<BuildEntry> getBuilds() {
        List<BuildEntry> out = new ArrayList<>();
        for (Job<?,?> job : Jenkins.get().getAllItems(Job.class)) {
            job.getBuilds().forEach(run -> {
                BuildReportAction a = run.getAction(BuildReportAction.class);
                if (a != null) {
                    out.add(new BuildEntry(
                            run.getUrl(),
                            run.getNumber(),
                            run.getDisplayName(),
                            a.getTimestamp()
                    ));
                }
            });
        }
        return out;
    }

    /**
     * buildToken에 대응하는 리포트 파일을 읽어서 문자열로 리턴합니다.
     * buildToken은 빌드 번호(숫자) 혹은 파일 접미사(예: timestamp)일 수 있습니다.
     */
    public String getReportContent(String buildToken) throws IOException {
        File home = Jenkins.get().getRootDir();
        Path report = home.toPath().resolve("mcp_report/result" + buildToken + ".txt");
        if (!Files.exists(report)) {
            return "Report file not found for build " + buildToken;
        }
        return Files.readString(report);
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
