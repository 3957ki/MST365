package io.jenkins.extensions;

import hudson.Extension;
import hudson.model.RootAction;
import io.jenkins.extensions.dto.ScriptEntry;
import io.jenkins.extensions.dto.ScriptModel;
import jenkins.model.Jenkins;
import org.kohsuke.stapler.QueryParameter;
import org.kohsuke.stapler.StaplerRequest;
import org.kohsuke.stapler.StaplerResponse;
import org.kohsuke.stapler.interceptor.RequirePOST;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.servlet.ServletException;
import java.io.*;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;

@Extension
public class ScriptAction implements RootAction {
    @Override public String getIconFileName() { return "clipboard.png"; }
    @Override public String getDisplayName()    { return "Scripts"; }
    @Override public String getUrlName()        { return "scripts"; }

    private File getDir() throws IOException {
        File d = new File(Jenkins.get().getRootDir(), "scripts");
        if (!d.exists() && (!d.mkdirs() && !d.exists())) {
            throw new IOException("스크립트 저장 디렉터리를 생성하지 못했습니다: " + d.getAbsolutePath());
        }
        return d;
    }

    /**
     * JSON(.json) 및 텍스트(.txt) 파일 모두 목록에 포함
     */
    public List<ScriptEntry> getScripts() throws IOException {
        File[] files = getDir().listFiles(f ->
                f.getName().endsWith(".json") || f.getName().endsWith(".txt")
        );
        if (files == null) return Collections.emptyList();

        List<ScriptEntry> out = new ArrayList<>();
        for (File f : files) {
            String name = f.getName();
            // 제목에 항상 확장자 포함
            String title = name;
            out.add(new ScriptEntry(title, name, new Date(f.lastModified())));
        }
        out.sort(Comparator.comparing(ScriptEntry::getModified).reversed());
        return out;
    }

    /**
     * JSON 스크립트 편집 뷰 바인딩 (input.jelly)
     */
    public ScriptModel getIt(@QueryParameter String script) throws IOException {
        if (script == null) return new ScriptModel();
        File f = new File(getDir(), script);
        if (f.exists() && script.endsWith(".json")) {
            return load(f);
        }
        return new ScriptModel();
    }

    /**
     * TXT 스크립트 편집 뷰 바인딩 (input_txt.jelly)
     */
    public ScriptModel getInput_txt(@QueryParameter String script) throws IOException {
        if (script == null) return new ScriptModel();
        File f = new File(getDir(), script);
        if (!f.exists()) return new ScriptModel();

        if (script.endsWith(".json")) {
            // 만약 JSON이라면 기존 로드 로직 재사용
            return load(f);
        } else {
            // TXT 파일 내용 읽어서 모델에 주입
            String content = new String(Files.readAllBytes(f.toPath()), StandardCharsets.UTF_8);
            ScriptModel m = new ScriptModel();
            m.setTitle(script.substring(0, script.lastIndexOf('.')));
            m.setContent(content);
            return m;
        }
    }

    /**
     * JSON 스크립트 저장/삭제 핸들러
     */
    @RequirePOST
    public void doSave(StaplerRequest req, StaplerResponse rsp)
            throws IOException, ServletException {
        req.setCharacterEncoding(StandardCharsets.UTF_8.name());

        String json = req.getParameter("jsonData");
        ScriptModel model = ScriptModel.fromJson(json);

        String fileName = sanitize(model.getTitle()) + ".json";
        Path target = getDir().toPath().resolve(fileName);

        ObjectMapper mapper = new ObjectMapper();
        mapper.getFactory().configure(JsonGenerator.Feature.ESCAPE_NON_ASCII, false);

        try (BufferedWriter writer = Files.newBufferedWriter(
                target,
                StandardCharsets.UTF_8,
                StandardOpenOption.CREATE,
                StandardOpenOption.TRUNCATE_EXISTING)) {
            mapper.writerWithDefaultPrettyPrinter().writeValue(writer, model);
        }

        // 포트 제거된 루트 URL 얻어서 리다이렉트
        String base = getRootUrlWithoutPort();
        rsp.sendRedirect2(base + "jenkins/" + getUrlName());
    }

    /**
     * TXT 스크립트 저장/삭제 핸들러
     */
    @RequirePOST
    public void doSaveTxt(StaplerRequest req, StaplerResponse rsp)
            throws IOException {
        req.setCharacterEncoding(StandardCharsets.UTF_8.name());

        // JSON 대신 파라미터로 바로 읽습니다
        String title   = req.getParameter("title");
        String content = req.getParameter("content");
        String action  = req.getParameter("action"); // null 또는 "delete"

        // 파일명 결정
        String fileName = sanitize(title) + ".txt";
        Path target = getDir().toPath().resolve(fileName);

        if ("delete".equals(action)) {
            Files.deleteIfExists(target);
        } else {
            // 순수 텍스트를 UTF-8로 저장
            Files.write(
                    target,
                    content != null ? content.getBytes(StandardCharsets.UTF_8) : new byte[0],
                    StandardOpenOption.CREATE,
                    StandardOpenOption.TRUNCATE_EXISTING
            );
        }

        // 저장/삭제 후 목록으로
        // 포트 제거된 루트 URL 얻어서 리다이렉트
        String base = getRootUrlWithoutPort();
        rsp.sendRedirect2(base + "jenkins/" + getUrlName());
    }

    /**
     * JSON 파일 로드 유틸
     */
    private ScriptModel load(File f) {
        ObjectMapper mapper = new ObjectMapper();
        try (BufferedReader reader = Files.newBufferedReader(
                f.toPath(),
                StandardCharsets.UTF_8)) {
            return mapper.readValue(reader, ScriptModel.class);
        } catch (IOException e) {
            return new ScriptModel();
        }
    }

    /**
     * 파일명에 사용할 수 없는 문자를 _ 로 대체
     */
    private String sanitize(String s) {
        return s.replaceAll("[\\\\/:*?\"<>|]", "_");
    }

    /**
     * Jenkins.get().getRootUrl() 에서 포트 번호를 제거하고
     * "https://호스트명/" 형태로 반환
     */
    private String getRootUrlWithoutPort() {
        String root = Jenkins.get().getRootUrl();
        if (root == null) {
            return "/";
        }
        try {
            // URL로 파싱해서 port를 -1로 설정
            URI uri = new URI(root);
            URI stripped = new URI(
                    uri.getScheme(),
                    uri.getUserInfo(),
                    uri.getHost(),
                    -1,
                    uri.getPath(),
                    uri.getQuery(),
                    uri.getFragment()
            );
            String s = stripped.toString();
            // ensure 끝에 슬래시
            return s.endsWith("/") ? s : s + "/";
        } catch (URISyntaxException e) {
            // 실패하면 원본 리턴
            try {
                URL url = new URL(root);
                String scheme = url.getProtocol();
                String host   = url.getHost();
                return scheme + "://" + host + "/";
            } catch (MalformedURLException ex) {
                return root;
            }
        }
    }
}
