package demo.demo_back.service.impl;

import demo.demo_back.domain.Board;
import demo.demo_back.domain.Comment;
import demo.demo_back.domain.User;
import demo.demo_back.dto.CommentResponseDto;
import demo.demo_back.exception.BoardNotFoundException;
import demo.demo_back.repository.BoardRepository;
import demo.demo_back.repository.CommentRepository;
import demo.demo_back.repository.UserRepository;
import demo.demo_back.service.CommentService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final BoardRepository boardRepository;
    private final UserRepository userRepository;

    @Override
    public CommentResponseDto createComment(Long boardId, Long userId, String content) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(BoardNotFoundException::new);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Comment comment = Comment.builder()
                .board(board)
                .user(user)
                .content(content)
                .isDeleted(false)
                .build();

        Comment saved = commentRepository.save(comment);

        return CommentResponseDto.builder()
                .id(saved.getId())
                .userId(user.getId())
                .boardId(board.getId())
                .content(saved.getContent())
                .createdAt(saved.getCreatedAt())
                .updatedAt(saved.getUpdatedAt())
                .isDeleted(saved.isDeleted())
                .deletedAt(saved.getDeletedAt())
                .build();
    }

    @Override
    public List<CommentResponseDto> getCommentsByBoardId(Long boardId) {
        List<Comment> comments = commentRepository.findByBoardId(boardId);

        return comments.stream()
                .map(comment -> CommentResponseDto.builder()
                        .id(comment.getId())
                        .userId(comment.getUser().getId())
                        .boardId(comment.getBoard().getId())
                        .content(comment.getContent())
                        .createdAt(comment.getCreatedAt())
                        .updatedAt(comment.getUpdatedAt())
                        .isDeleted(comment.isDeleted())
                        .deletedAt(comment.getDeletedAt())
                        .build())
                .toList();
    }

}
