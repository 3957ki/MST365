package demo.demo_back.controller;

import demo.demo_back.domain.Board;
import demo.demo_back.domain.User;
import demo.demo_back.dto.BoardCreateRequestDto;
import demo.demo_back.dto.BoardCreateResponseDto;
import demo.demo_back.dto.BoardListResponseDto;
import demo.demo_back.dto.BoardDetailResponseDto;
import demo.demo_back.dto.MessageResponseDto;
import demo.demo_back.exception.BoardNotFoundException;
import demo.demo_back.exception.UnauthorizedAccessException;
import demo.demo_back.service.BoardService;
import org.springframework.beans.factory.annotation.Autowired;
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

    @GetMapping
    public ResponseEntity<?> getAllBoards() {
        try {
            BoardListResponseDto response = boardService.getAllBoards();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "서버 오류");
            errorResponse.put("details", "게시물 목록을 불러오는데 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/{boardId}")
    public ResponseEntity<?> getBoardById(@PathVariable Long boardId) {
        try {
            BoardDetailResponseDto response = boardService.getBoardById(boardId);
            return ResponseEntity.ok(response);
        } catch (BoardNotFoundException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "게시물을 찾을 수 없습니다.");
            errorResponse.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "서버 오류 발생");
            errorResponse.put("details", "단일 게시물 조회 중 예상치 못한 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping
    public ResponseEntity<?> createBoard(@RequestBody BoardCreateRequestDto request) {
        try {
            // Request validation
            if (request.getTitle() == null || request.getTitle().trim().isEmpty() ||
                request.getContent() == null || request.getContent().trim().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "잘못된 요청입니다.");
                errorResponse.put("details", "제목과 내용은 필수 입력 항목입니다.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            // Get authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User user = (User) authentication.getPrincipal();

            // Create board
            Board board = boardService.createBoard(user.getId(), request.getTitle(), request.getContent());

            // Create response
            BoardCreateResponseDto.BoardDataDto data = new BoardCreateResponseDto.BoardDataDto(
                    board.getId(),
                    board.getTitle(),
                    board.getContent(),
                    user.getId(),
                    user.getUsername(),
                    board.getCreatedAt(),
                    board.getUpdatedAt()
            );

            BoardCreateResponseDto response = new BoardCreateResponseDto(
                    "게시물이 성공적으로 작성되었습니다.",
                    data
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "서버 오류 발생");
            errorResponse.put("details", "게시물 작성 중 예상치 못한 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping("/{boardId}")
    public ResponseEntity<?> deleteBoard(@PathVariable Long boardId) {
        try {
            // 현재 인증된 사용자 정보 가져오기
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "인증되지 않은 요청입니다.");
                errorResponse.put("details", "게시물을 삭제하려면 로그인해야 합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            User user = (User) authentication.getPrincipal();
            MessageResponseDto response = boardService.deleteBoard(boardId, user.getId());
            return ResponseEntity.ok(response);

        } catch (UnauthorizedAccessException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "권한이 없습니다.");
            errorResponse.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);

        } catch (BoardNotFoundException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "게시물을 찾을 수 없습니다.");
            errorResponse.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "서버 오류 발생");
            errorResponse.put("details", "게시물 삭제 중 예상치 못한 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
} 