package demo.demo_back.service;

import demo.demo_back.dto.CommentResponseDto;

public interface CommentService {
    CommentResponseDto createComment(Long boardId, Long userId, String content);
}
