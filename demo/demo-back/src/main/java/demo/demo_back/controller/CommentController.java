package demo.demo_back.controller;

import demo.demo_back.domain.User;
import demo.demo_back.dto.CommentRequestDto;
import demo.demo_back.dto.CommentResponseDto;
import demo.demo_back.exception.BoardNotFoundException;
import demo.demo_back.exception.UnauthorizedException;
import demo.demo_back.service.CommentService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/boards/{boardId}/comments")
public class CommentController {

    private final CommentService commentService;

    /**
     * 댓글 작성
     */
    @PostMapping
    public ResponseEntity<?> createComment(
            @PathVariable Long boardId,
            @RequestBody @Valid CommentRequestDto requestDto,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            Long userId = ((User) userDetails).getId();
            CommentResponseDto saved = commentService.createComment(boardId, userId, requestDto.getContent());

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    Map.of("message", "댓글이 성공적으로 작성되었습니다.", "data", saved)
            );

        } catch (BoardNotFoundException e) {
            return buildError("게시물을 찾을 수 없습니다.", e.getMessage(), HttpStatus.NOT_FOUND);

        } catch (UnauthorizedException | NullPointerException e) {
            return buildError("인증되지 않은 요청입니다.", "댓글을 작성하려면 유효한 로그인이 필요합니다.", HttpStatus.UNAUTHORIZED);

        } catch (Exception e) {
            return buildError("서버 오류 발생", "댓글 작성 처리 중 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 댓글 전체 조회
     */
    @GetMapping
    public ResponseEntity<?> getComments(@PathVariable Long boardId) {
        List<CommentResponseDto> comments = commentService.getCommentsByBoardId(boardId);
        return ResponseEntity.ok(comments);
    }

    /**
     * 댓글 수정
     */
    @PatchMapping("/{commentId}")
    public ResponseEntity<?> updateComment(
            @PathVariable Long boardId,
            @PathVariable Long commentId,
            @RequestBody @Valid CommentRequestDto requestDto,
            @AuthenticationPrincipal User userDetails) {

        try {
            Long userId = userDetails.getId();
            CommentResponseDto updated = commentService.updateComment(boardId, commentId, userId, requestDto.getContent());

            return ResponseEntity.ok(
                    Map.of("message", "댓글이 성공적으로 수정되었습니다.", "data", updated)
            );

        } catch (UnauthorizedException e) {
            return buildError("수정 권한 없음", e.getMessage(), HttpStatus.UNAUTHORIZED);

        } catch (BoardNotFoundException e) {
            return buildError("게시물을 찾을 수 없습니다.", e.getMessage(), HttpStatus.NOT_FOUND);

        } catch (Exception e) {
            return buildError("서버 오류", "댓글 수정 중 문제가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 댓글 삭제
     */
    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long boardId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal User userDetails) {

        try {
            Long userId = userDetails.getId();
            commentService.deleteComment(boardId, commentId, userId);

            return ResponseEntity.ok(Map.of("message", "댓글이 성공적으로 삭제되었습니다."));

        } catch (UnauthorizedException e) {
            return buildError("삭제 권한 없음", e.getMessage(), HttpStatus.UNAUTHORIZED);

        } catch (BoardNotFoundException e) {
            return buildError("게시물을 찾을 수 없습니다.", e.getMessage(), HttpStatus.NOT_FOUND);

        } catch (Exception e) {
            return buildError("서버 오류", "댓글 삭제 중 문제가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ---------------------
    // 공통 유틸 메서드
    // ---------------------

    private ResponseEntity<?> buildError(String error, String detail, HttpStatus status) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", error);
        errorResponse.put("details", detail);
        return ResponseEntity.status(status).body(errorResponse);
    }
}
