package demo.demo_back.service;

import demo.demo_back.dto.CommentResponseDto;

import java.util.List;

public interface CommentService {
    CommentResponseDto createComment(Long boardId, Long userId, String content);
    // CommentService.java
    List<CommentResponseDto> getCommentsByBoardId(Long boardId);

    CommentResponseDto updateComment(Long boardId, Long commentId, Long userId, String newContent);

    void deleteComment(Long boardId, Long commentId, Long userId);

}
