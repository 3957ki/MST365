package io.jenkins.plugins.steps;

import hudson.FilePath;
import hudson.model.Run;
import hudson.model.TaskListener;
import io.jenkins.actions.BuildReportAction;
import org.apache.commons.io.IOUtils;
import org.jenkinsci.plugins.workflow.steps.SynchronousNonBlockingStepExecution;
import org.jenkinsci.plugins.workflow.steps.StepContext;
import jenkins.model.Jenkins;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URISyntaxException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;
import java.util.Enumeration;
import java.util.concurrent.TimeUnit;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;

public class CoreLogicStepExecution extends SynchronousNonBlockingStepExecution<Void> {
    private static final long serialVersionUID = 1L;
    private final transient CoreLogicStep step;

    protected CoreLogicStepExecution(CoreLogicStep step, StepContext context) {
        super(context);
        this.step = step;
    }

    @Override
    protected Void run() throws Exception {
        // 1) 워크스페이스 및 Python 디렉터리 준비
        FilePath workspace = getContext().get(FilePath.class);
        if (workspace == null) {
            throw new IllegalStateException("워크스페이스를 가져올 수 없습니다");
        }
        File pythonDir = new File(workspace.getRemote(), "resources/python");
        if (!pythonDir.exists() && !pythonDir.mkdirs()) {
            throw new IllegalStateException("Python 디렉터리 생성 실패: " + pythonDir);
        }
        TaskListener listener = getContext().get(TaskListener.class);
        Run<?, ?> run = getContext().get(Run.class);

        // 2) 번들된 Python 스크립트 추출
        listener.getLogger().println("▶ 번들된 Python 스크립트 추출 시작");
        extractResources("python", pythonDir, listener);
        listener.getLogger().println("▶ 스크립트 추출 완료");

        // 8) 시나리오 파일 로드 from JENKINS_HOME/scripts
        String scenarioName = step.getInput();
        if (!scenarioName.endsWith(".json")) scenarioName += ".json";
        File jenkinsHome = Jenkins.get().getRootDir();
        File scriptsDir = new File(jenkinsHome, "scripts");
        File scenarioFile = new File(scriptsDir, scenarioName);
        if (!scenarioFile.exists()) {
            throw new IllegalArgumentException("시나리오 파일이 없습니다: " + scenarioFile);
        }
        listener.getLogger().println("▶ 시나리오 로드: " + scenarioName);
        String scenarioContent = new String(
                Files.readAllBytes(scenarioFile.toPath()), StandardCharsets.UTF_8
        );
        listener.getLogger().println(scenarioContent);

        // 8) 워크스페이스 FilePath 가져오기
        FilePath workspaceFilePath = getContext().get(FilePath.class);

        // 9) resources/python/setup.sh 파일 권한 변경 (0755)
        FilePath setupSh = workspaceFilePath.child("resources/python/setup.sh");
        listener.getLogger().println("▶ setup.sh chmod 0755 …");
        setupSh.chmod(0755);

        // 9) MCP 서버 기동 및 대기
        listener.getLogger().println("▶ setup 스크립트 실행...");
        String osName = System.getProperty("os.name").toLowerCase();
        ProcessBuilder pbSetup;
        if (osName.contains("win")) {
            pbSetup = new ProcessBuilder("cmd.exe", "/c", "setup.bat");
        } else {
            pbSetup = new ProcessBuilder("bash", "setup.sh");
        }
        pbSetup.directory(pythonDir).redirectErrorStream(true);
        Process setupProc = pbSetup.start();
        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(setupProc.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = br.readLine()) != null) {
                listener.getLogger().println(line);
            }
        }
        if (setupProc.waitFor() != 0) {
            throw new IllegalStateException("setup 스크립트 실행 실패");
        }
        listener.getLogger().println("▶ setup 완료");

        // 10) Python 스크립트 직접 실행: activate venv 후 python 실행
        listener.getLogger().println("▶ Python 테스트 실행: main_logic.py (activate virtualenv)");
        String scenarioPath = scenarioFile.getAbsolutePath();
        String buildNumber = String.valueOf(run.getNumber());
        File resultsDir = new File(Jenkins.get().getRootDir(), "results");
        if (!resultsDir.exists() && !resultsDir.mkdirs()) {
            listener.getLogger().println("▶ WARNING: results 디렉터리 생성 실패: " + resultsDir);
        }
        String outputDir = resultsDir.getAbsolutePath();
        listener.getLogger().println(
                String.format("▶ 인자: --file %s --build %s --output_dir %s",
                        scenarioPath, buildNumber, outputDir)
        );
        String activateScript = new File(pythonDir, ".venv/bin/activate").getAbsolutePath();
        String command = String.join(" && ",
                String.format("source %s", activateScript),
                String.format("python main_logic.py --file '%s' --build %s --output_dir '%s'",
                        scenarioPath, buildNumber, outputDir)
        );
        ProcessBuilder pbRun = new ProcessBuilder("bash", "-c", command)
                .directory(pythonDir)
                .redirectErrorStream(true);
        Process runProc = pbRun.start();
        try (BufferedReader rdr = new BufferedReader(
                new InputStreamReader(runProc.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = rdr.readLine()) != null) {
                listener.getLogger().println(line);
            }
        }
        int runExit = runProc.waitFor();
        listener.getLogger().println("▶ 테스트 종료 (exit=" + runExit + ")");
        String result = runExit == 0 ? "SUCCESS" : "FAIL";
        run.addAction(new BuildReportAction(scenarioName, result));
        run.save();
        return null;
    }

    private void extractResources(String resourcePath, File targetDir, TaskListener listener) throws IOException {
        ClassLoader cl = getClass().getClassLoader();
        URL dirURL = cl.getResource(resourcePath);
        if (dirURL == null) throw new IOException("리소스 경로를 찾을 수 없습니다: " + resourcePath);
        if ("file".equals(dirURL.getProtocol())) {
            try {
                Path src = Paths.get(dirURL.toURI());
                Files.walk(src).forEach(path -> {
                    try {
                        Path rel = src.relativize(path);
                        File dest = new File(targetDir, rel.toString());
                        if (Files.isDirectory(path)) {
                            if (!dest.mkdirs() && !dest.isDirectory()) {
                                listener.getLogger().println("디렉터리 생성 실패: " + dest);
                            }
                        } else {
                            File parent = dest.getParentFile();
                            if (parent != null && !parent.exists() && !parent.mkdirs()) {
                                listener.getLogger().println("디렉터리 생성 실패: " + parent);
                            }
                            Files.copy(path, dest.toPath());
                        }
                    } catch (Exception e) {
                        listener.getLogger().println("리소스 복사 오류: " + e.getMessage());
                    }
                });
            } catch (URISyntaxException e) {
                throw new IOException("리소스 경로 URI 변환 실패", e);
            }
        } else if ("jar".equals(dirURL.getProtocol())) {
            String jarPath = dirURL.getPath().substring(5, dirURL.getPath().indexOf("!"));
            try (JarFile jar = new JarFile(URLDecoder.decode(jarPath, "UTF-8"))) {
                Enumeration<JarEntry> entries = jar.entries();
                while (entries.hasMoreElements()) {
                    JarEntry entry = entries.nextElement();
                    String name = entry.getName();
                    if (!name.startsWith(resourcePath + "/")) continue;
                    String rel = name.substring(resourcePath.length() + 1);
                    File out = new File(targetDir, rel);
                    if (entry.isDirectory()) {
                        if (!out.mkdirs() && !out.isDirectory()) {
                            listener.getLogger().println("디렉터리 생성 실패: " + out);
                        }
                    } else {
                        File parent = out.getParentFile();
                        if (parent != null && !parent.exists() && !parent.mkdirs()) {
                            listener.getLogger().println("디렉터리 생성 실패: " + parent);
                        }
                        try (InputStream in = jar.getInputStream(entry);
                             OutputStream os = new FileOutputStream(out)) {
                            IOUtils.copy(in, os);
                        }
                    }
                }
            }
        } else {
            throw new IOException("지원하지 않는 프로토콜: " + dirURL.getProtocol());
        }
    }

    private void deleteRecursively(Path path) throws IOException {
        if (!Files.exists(path)) return;
        Files.walk(path)
                .sorted(Comparator.reverseOrder())
                .map(Path::toFile)
                .forEach(File::delete);
    }

    private boolean waitForHttp(String urlStr, int attempts) {
        for (int i = 0; i < attempts; i++) {
            try {
                HttpURLConnection conn = (HttpURLConnection) new URL(urlStr).openConnection();
                conn.setConnectTimeout(2000);
                conn.setReadTimeout(2000);
                if (conn.getResponseCode() == 200) return true;
            } catch (IOException ignored) {}
            try {
                TimeUnit.SECONDS.sleep(1);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                return false;
            }
        }
        return false;
    }
}
