package demo.demo_back.controller;

import demo.demo_back.domain.User;
import demo.demo_back.dto.*;
import demo.demo_back.service.BoardService;
import demo.demo_back.service.CommentService;
import demo.demo_back.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;
    private final BoardService boardService;
    private final CommentService commentService;

    @Autowired
    public UserController(UserService userService, BoardService boardService, CommentService commentService) {
        this.userService = userService;
        this.boardService = boardService;
        this.commentService = commentService;
    }

    /**
     * 사용자 정보 조회
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUser(@PathVariable Long userId) {
        try {
            Optional<User> userOptional = userService.getUserById(userId);

            if (userOptional.isPresent()) {
                User user = userOptional.get();
                UserResponseDto response = new UserResponseDto(
                        "사용자 정보가 성공적으로 조회되었습니다.",
                        new UserResponseDto.UserDataDto(user.getId(), user.getUsername(), user.getCreatedAt(), user.getUpdatedAt())
                );
                return ResponseEntity.ok(response);
            } else {
                return buildError("사용자를 찾을 수 없습니다.", "요청하신 사용자 ID에 해당하는 사용자가 존재하지 않습니다.", HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return buildError("서버 오류 발생", "사용자 정보 조회 중 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 비밀번호 변경
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody PasswordChangeRequestDto request) {
        try {
            if (isInvalidText(request.getCurrentPassword()) ||
                    isInvalidText(request.getNewPassword()) ||
                    isInvalidText(request.getNewPasswordConfirm())) {
                return buildError("잘못된 요청입니다.", "필수 필드가 누락되었습니다.", HttpStatus.BAD_REQUEST);
            }

            if (!request.getNewPassword().equals(request.getNewPasswordConfirm())) {
                return buildError("비밀번호 수정 실패", "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.", HttpStatus.BAD_REQUEST);
            }

            User user = getCurrentUser();

            boolean success = userService.changePassword(user.getId(), request.getCurrentPassword(), request.getNewPassword());
            if (success) {
                return ResponseEntity.ok(Map.of("message", "비밀번호가 성공적으로 수정되었습니다."));
            } else {
                return buildError("비밀번호 수정 실패", "현재 비밀번호가 올바르지 않습니다.", HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            return buildError("서버 오류 발생", "비밀번호 수정 중 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 회원 탈퇴
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            User loggedInUser = getCurrentUser();
            if (!loggedInUser.getId().equals(userId)) {
                return buildError("접근 거부", "자신의 계정만 삭제할 수 있습니다.", HttpStatus.FORBIDDEN);
            }

            userService.deleteUser(userId);
            return ResponseEntity.ok(Map.of("message", "회원 탈퇴가 완료되었습니다."));
        } catch (Exception e) {
            return buildError("서버 오류 발생", "회원 탈퇴 중 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 사용자 게시물 조회
     */
    @GetMapping("/{userId}/boards")
    public ResponseEntity<?> getBoardsByUser(@PathVariable Long userId) {
        try {
            List<BoardListResponseDto.BoardItemDto> boards = boardService.getBoardsByUserId(userId);
            return ResponseEntity.ok(new BoardListResponseDto("사용자의 게시물이 성공적으로 조회되었습니다.", boards));
        } catch (Exception e) {
            return buildError("서버 오류 발생", "사용자 게시물 목록을 불러오는 중 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 사용자 댓글 조회
     */
    @GetMapping("/{userId}/comments")
    public ResponseEntity<?> getCommentsByUser(@PathVariable Long userId,
                                               @AuthenticationPrincipal User userDetails) {
        try {
            if (userDetails == null) {
                return buildError("인증되지 않은 요청입니다.", "사용자 댓글 목록을 조회하려면 로그인이 필요합니다.", HttpStatus.UNAUTHORIZED);
            }

            if (!userDetails.getId().equals(userId)) {
                return buildError("권한이 없습니다.", "다른 사용자의 댓글 목록을 조회할 권한이 없습니다.", HttpStatus.FORBIDDEN);
            }

            Optional<User> user = userService.getUserById(userId);
            if (user.isEmpty()) {
                return buildError("사용자를 찾을 수 없습니다.", "요청하신 사용자 ID에 해당하는 사용자가 존재하지 않습니다.", HttpStatus.NOT_FOUND);
            }

            List<CommentResponseDto> comments = commentService.getCommentsByUserId(userId);
            return ResponseEntity.ok(Map.of("message", "사용자의 댓글 목록입니다.", "data", comments));

        } catch (Exception e) {
            return buildError("서버 오류 발생", "사용자 댓글 목록을 불러오는 중 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
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
