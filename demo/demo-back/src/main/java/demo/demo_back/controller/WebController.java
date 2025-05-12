package demo.demo_back.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {

    @GetMapping({
            "/",              // 메인 페이지
            "/login",         // 로그인
            "/signup",        // 회원가입
            "/board",         // 게시판 목록
            "/board/**",      // 게시판 상세
            "/mypage",        // 마이페이지
            "/admin/**"       // 관리자 영역
    })
    public String index() {
        return "forward:/index.html";
    }
}
