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

        // 3) global virtualenv 설치 확인
        listener.getLogger().println("▶ global virtualenv 모듈 설치 여부 확인...");
        ProcessBuilder pbVirtCheck = new ProcessBuilder("python3", "-c", "import virtualenv")
                .directory(pythonDir).redirectErrorStream(true);
        Process procVirtCheck = pbVirtCheck.start();
        if (procVirtCheck.waitFor() != 0) {
            throw new IllegalStateException("virtualenv 모듈이 없습니다. 에이전트 머신에 'python3-virtualenv' 패키지를 설치하세요.");
        }
        listener.getLogger().println("  - virtualenv 이미 설치됨");

        // 4) 가상환경(.venv) 생성 (virtualenv 사용)
        File venvDir = new File(pythonDir, ".venv");
        if (venvDir.isDirectory()) {
            listener.getLogger().println("▶ 가상환경(.venv) 이미 존재, 생성 단계 생략");
        } else {
            listener.getLogger().println("▶ 가상환경(.venv) 생성 시작 (virtualenv)");
            ProcessBuilder pbVirt = new ProcessBuilder("python3", "-m", "virtualenv", ".venv")
                    .directory(pythonDir).redirectErrorStream(true);
            Process procVirt = pbVirt.start();
            if (procVirt.waitFor() != 0) {
                throw new IllegalStateException("virtualenv 가상환경 생성 실패");
            }
            listener.getLogger().println("▶ 가상환경(.venv) 생성 완료");
        }
        String pythonBin = new File(pythonDir, ".venv/bin/python").getAbsolutePath();

        // 5) venv 내부 pip 준비 여부 확인 및 재생성
        listener.getLogger().println("▶ venv 내부 pip 준비 여부 확인");
        ProcessBuilder pbPipCheck = new ProcessBuilder(pythonBin, "-m", "pip", "--version")
                .directory(pythonDir).redirectErrorStream(true);
        Process procPipCheck = pbPipCheck.start();
        if (procPipCheck.waitFor() != 0) {
            listener.getLogger().println("  - venv 내부에 pip 모듈이 없습니다. 기존 .venv 삭제 후 virtualenv로 재생성");
            deleteRecursively(venvDir.toPath());
            ProcessBuilder pbRecreate = new ProcessBuilder("python3", "-m", "virtualenv", ".venv")
                    .directory(pythonDir).redirectErrorStream(true);
            Process procRecreate = pbRecreate.start();
            if (procRecreate.waitFor() != 0) {
                throw new IllegalStateException("virtualenv로 가상환경 재생성 실패");
            }
            listener.getLogger().println("  - virtualenv로 venv 재생성 완료");
            pythonBin = new File(pythonDir, ".venv/bin/python").getAbsolutePath();
        } else {
            listener.getLogger().println("  - pip 이미 준비됨");
        }

        // 6) uv 모듈 설치 여부 확인 및 설치
        listener.getLogger().println("▶ uv 모듈 설치 여부 확인...");
        ProcessBuilder pbCheck = new ProcessBuilder(pythonBin, "-c", "import uv")
                .directory(pythonDir).redirectErrorStream(true);
        Process procCheck = pbCheck.start();
        if (procCheck.waitFor() != 0) {
            listener.getLogger().println("  - uv 모듈 미설치, 설치 진행...");
            ProcessBuilder pbInstall = new ProcessBuilder(pythonBin, "-m", "pip", "install", "uv")
                    .directory(pythonDir).redirectErrorStream(true);
            Process procInstall = pbInstall.start();
            try (BufferedReader br = new BufferedReader(
                    new InputStreamReader(procInstall.getInputStream(), StandardCharsets.UTF_8))) {
                String l;
                while ((l = br.readLine()) != null) {
                    listener.getLogger().println(l);
                }
            }
            if (procInstall.waitFor() != 0) {
                throw new IllegalStateException("uv 설치 실패");
            }
            listener.getLogger().println("  - uv 설치 완료");
        } else {
            listener.getLogger().println("  - uv 모듈 이미 설치됨");
        }

        // 7) 의존성 설치 (uv sync)
        listener.getLogger().println("▶ 의존성 설치: uv sync");
        ProcessBuilder pbSync = new ProcessBuilder(pythonBin, "-m", "uv", "sync")
                .directory(pythonDir).redirectErrorStream(true);
        Process syncProc = pbSync.start();
        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(syncProc.getInputStream(), StandardCharsets.UTF_8))) {
            String l;
            while ((l = br.readLine()) != null) {
                listener.getLogger().println(l);
            }
        }
        if (syncProc.waitFor() != 0) {
            throw new IllegalStateException("uv sync 실패");
        }
        listener.getLogger().println("▶ 의존성 설치 완료");

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

        // 9) MCP 서버 기동 및 대기
        // 9) setup 스크립트 실행 (Windows: setup.bat, Linux: setup.sh)
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

        // 10) Python 스크립트 직접 실행 (빌드 번호 & 출력 디렉터리 인자 포함)
        listener.getLogger().println("▶ Python 테스트 실행: main_logic.py");
        String scenarioPath = scenarioFile.getAbsolutePath();

        // 빌드 번호
        String buildNumber = String.valueOf(run.getNumber());

        // JENKINS_HOME/results 경로 준비 (없으면 생성)
        File resultsDir = new File(Jenkins.get().getRootDir(), "results");
        if (!resultsDir.exists()) {
            if (!resultsDir.mkdirs()) {
                listener.getLogger().println("▶ WARNING: results 디렉터리 생성 실패: " + resultsDir);
            }
        }
        String outputDir = resultsDir.getAbsolutePath();

        listener.getLogger().println(
                String.format("▶ 인자: --file %s --build %s --output_dir %s",
                        scenarioPath, buildNumber, outputDir)
        );

        ProcessBuilder pbRun = new ProcessBuilder(
                pythonBin,
                "main_logic.py",
                "--file",       scenarioPath,
                "--build",      buildNumber,
                "--output_dir", outputDir
        )
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

        // 11) 결과 액션 등록
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
