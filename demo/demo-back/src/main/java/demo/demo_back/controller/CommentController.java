package demo.demo_back.controller;

import demo.demo_back.domain.User;
import demo.demo_back.dto.CommentRequestDto;
import demo.demo_back.dto.CommentResponseDto;
import demo.demo_back.exception.BoardNotFoundException;
import demo.demo_back.exception.UnauthorizedException;
import demo.demo_back.service.CommentService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/boards/{boardId}/comments")
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<?> createComment(
            @PathVariable Long boardId,
            @RequestBody @Valid CommentRequestDto requestDto,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            Long userId = ((User) userDetails).getId();
            CommentResponseDto saved = commentService.createComment(boardId, userId, requestDto.getContent());

            return ResponseEntity.status(201).body(
                    Map.of("message", "댓글이 성공적으로 작성되었습니다.", "data", saved)
            );

        } catch (BoardNotFoundException e) {
            return ResponseEntity.status(404).body(
                    Map.of("error", "게시물을 찾을 수 없습니다.", "details", e.getMessage())
            );

        } catch (UnauthorizedException | NullPointerException e) {
            return ResponseEntity.status(401).body(
                    Map.of("error", "인증되지 않은 요청입니다.", "details", "댓글을 작성하려면 유효한 로그인이 필요합니다.")
            );

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(
                    Map.of("error", "서버 오류 발생", "details", "댓글 작성 처리 중 예상치 못한 오류가 발생했습니다.")
            );
        }
    }
}
