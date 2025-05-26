package demo.demo_back.controller;

import demo.demo_back.domain.Board;
import demo.demo_back.domain.User;
import demo.demo_back.dto.*;
import demo.demo_back.exception.BoardNotFoundException;
import demo.demo_back.exception.UnauthorizedAccessException;
import demo.demo_back.exception.InvalidRequestException;
import demo.demo_back.service.BoardService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/boards")
public class BoardController {

    private final BoardService boardService;

    @Autowired
    public BoardController(BoardService boardService) {
        this.boardService = boardService;
    }

    /**
     * 전체 게시물 조회
     */
    @GetMapping
    public ResponseEntity<?> getAllBoards(Pageable pageable) {
        try {
            BoardListResponseDto response = boardService.getAllBoards(pageable);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return buildError("서버 오류", "게시물 목록을 불러오는데 문제가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 게시물 상세 조회
     */
    @GetMapping("/{boardId}")
    public ResponseEntity<?> getBoardById(@PathVariable Long boardId) {
        try {
            BoardDetailResponseDto response = boardService.getBoardById(boardId);
            return ResponseEntity.ok(response);
        } catch (BoardNotFoundException e) {
            return buildError("게시물을 찾을 수 없습니다.", e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return buildError("서버 오류 발생", "단일 게시물 조회 중 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 게시물 생성
     */
    @PostMapping
    public ResponseEntity<?> createBoard(@RequestBody BoardCreateRequestDto request) {
        if (isInvalidText(request.getTitle()) || isInvalidText(request.getContent())) {
            return buildError("잘못된 요청입니다.", "제목과 내용은 필수 입력 항목입니다.", HttpStatus.BAD_REQUEST);
        }

        try {
            User user = getCurrentUser();
            Board board = boardService.createBoard(user.getId(), request.getTitle(), request.getContent());

            BoardCreateResponseDto.BoardDataDto data = new BoardCreateResponseDto.BoardDataDto(
                    board.getId(),
                    board.getTitle(),
                    board.getContent(),
                    user.getId(),
                    user.getUsername(),
                    board.getCreatedAt(),
                    board.getUpdatedAt()
            );
            BoardCreateResponseDto response = new BoardCreateResponseDto("게시물이 성공적으로 작성되었습니다.", data);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return buildError("서버 오류 발생", "게시물 작성 중 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 게시물 삭제
     */
    @DeleteMapping("/{boardId}")
    public ResponseEntity<?> deleteBoard(@PathVariable Long boardId) {
        try {
            User user = getCurrentUser();
            MessageResponseDto response = boardService.deleteBoard(boardId, user.getId());
            return ResponseEntity.ok(response);
        } catch (UnauthorizedAccessException e) {
            return buildError("권한이 없습니다.", e.getMessage(), HttpStatus.FORBIDDEN);
        } catch (BoardNotFoundException e) {
            return buildError("게시물을 찾을 수 없습니다.", e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return buildError("서버 오류 발생", "게시물 삭제 중 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 게시물 수정
     */
    @PatchMapping("/{boardId}")
    public ResponseEntity<?> updateBoard(@PathVariable Long boardId, @Valid @RequestBody BoardUpdateRequestDto request) {
        try {
            User user = getCurrentUser();
            BoardDetailResponseDto response = boardService.updateBoard(boardId, user.getId(), request);
            return ResponseEntity.ok(response);
        } catch (InvalidRequestException e) {
            return buildError("잘못된 요청입니다.", e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (UnauthorizedAccessException e) {
            return buildError("권한이 없습니다.", e.getMessage(), HttpStatus.FORBIDDEN);
        } catch (BoardNotFoundException e) {
            return buildError("게시물을 찾을 수 없습니다.", e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return buildError("서버 오류 발생", "게시물 수정 중 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ---------------------
    // 공통 유틸 메서드
    // ---------------------

    private boolean isInvalidText(String text) {
        return text == null || text.trim().isEmpty();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("인증된 사용자가 없습니다.");
        }
        return (User) authentication.getPrincipal();
    }

    private ResponseEntity<?> buildError(String error, String detail, HttpStatus status) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", error);
        errorResponse.put("details", detail);
        return ResponseEntity.status(status).body(errorResponse);
    }
}
