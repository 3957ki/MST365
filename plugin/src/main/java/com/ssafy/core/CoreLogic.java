package com.ssafy.core;

import jenkins.model.Jenkins;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;

public class CoreLogic {
    private static final Logger log = LoggerFactory.getLogger(CoreLogic.class);

    /**
     * classpath:/python/test-core-logic.py 리소스를 임시 파일로 추출합니다.
     */
    private Path extractScript() throws IOException {
        try (InputStream in = getClass().getClassLoader().getResourceAsStream("python/test-core-logic.py")) {
            if (in == null) {
                throw new FileNotFoundException("python/test-core-logic.py not found in classpath");
            }
            Path tmp = Files.createTempFile("test-core-logic-", ".py");
            tmp.toFile().deleteOnExit();
            Files.copy(in, tmp, StandardCopyOption.REPLACE_EXISTING);
            return tmp;
        }
    }

    /**
     * 입력값을 받아서 Python 스크립트를 실행하고, 결과를 반환하며 파일로 기록
     */
    public String process(String input) {
        String result = "";
        try {
            // 1) 스크립트를 임시 파일로 추출
            Path script = extractScript();

            // 2) Python 실행 (UTF-8 입출력 강제)
            ProcessBuilder pb = new ProcessBuilder("python", script.toString(), input);
            Map<String, String> env = pb.environment();
            env.put("PYTHONIOENCODING", "utf-8");
            env.put("PYTHONUTF8", "1");

            Process proc = pb.start();

            // 3) 표준출력에서 한 줄 읽기 (UTF-8 디코딩)
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(proc.getInputStream(), Charset.forName("UTF-8")))) {
                String line = reader.readLine();
                result = (line != null ? line : "");
            }

            // 4) 에러 로그 출력
            int exitCode = proc.waitFor();
            if (exitCode != 0) {
                try (BufferedReader err = new BufferedReader(
                        new InputStreamReader(proc.getErrorStream(), Charset.forName("UTF-8")))) {
                    StringBuilder sb = new StringBuilder();
                    String line;
                    while ((line = err.readLine()) != null) {
                        sb.append(line).append("\n");
                    }
                    log.error("Python 에러: \n{}", sb.toString());
                }
            }

            log.info("Python 결과: {}", result);

            // 5) Jenkins 홈에 리포트 파일로 쓰기
            writeReport(result);
        } catch (Exception e) {
            log.error("Python 스크립트 실행 오류", e);
        }
        return result;
    }

    private void writeReport(String content) throws IOException {
        File jenkinsHomeDir = Jenkins.get().getRootDir();
        File reportDir = new File(jenkinsHomeDir, "mcp_report");
        if (!reportDir.exists() && !reportDir.mkdirs()) {
            throw new IOException("리포트 디렉토리 생성 실패: " + reportDir.getAbsolutePath());
        }

        String buildNo = System.getenv("BUILD_NUMBER");
        if (buildNo == null || buildNo.isEmpty()) {
            buildNo = String.valueOf(System.currentTimeMillis());
        }

        File reportFile = new File(reportDir, "result" + buildNo + ".txt");
        try (BufferedWriter writer = new BufferedWriter(
                new OutputStreamWriter(new FileOutputStream(reportFile), Charset.forName("UTF-8")))) {
            writer.write(content != null ? content : "");
        }

        log.info("리포트가 생성되었습니다: {}", reportFile.getAbsolutePath());
    }
}
