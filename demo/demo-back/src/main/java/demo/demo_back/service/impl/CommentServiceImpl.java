package demo.demo_back.service.impl;

import demo.demo_back.domain.Board;
import demo.demo_back.domain.Comment;
import demo.demo_back.domain.User;
import demo.demo_back.dto.CommentResponseDto;
import demo.demo_back.exception.BoardNotFoundException;
import demo.demo_back.exception.UnauthorizedException;
import demo.demo_back.repository.BoardRepository;
import demo.demo_back.repository.CommentRepository;
import demo.demo_back.repository.UserRepository;
import demo.demo_back.service.CommentService;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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

        return toDto(saved);
    }

    @Override
    public List<CommentResponseDto> getCommentsByBoardId(Long boardId) {
        List<Comment> comments = commentRepository.findByBoard_IdAndIsDeletedFalseOrderByCreatedAtAsc(boardId);

        return comments.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public CommentResponseDto updateComment(Long boardId, Long commentId, Long userId, String newContent) {
        boardRepository.findById(boardId)
                .orElseThrow(() -> new BoardNotFoundException(boardId));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

        if (!comment.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("자신의 댓글만 수정할 수 있습니다.");
        }

        comment.setContent(newContent);
        comment.setUpdatedAt(LocalDateTime.now());

        return toDto(commentRepository.save(comment));
    }

    @Override
    public void deleteComment(Long boardId, Long commentId, Long userId) {
        boardRepository.findById(boardId)
                .orElseThrow(() -> new BoardNotFoundException(boardId));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

        if (!comment.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("자신의 댓글만 삭제할 수 있습니다.");
        }

        comment.setDeleted(true);
        comment.setDeletedAt(LocalDateTime.now());
        commentRepository.save(comment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponseDto> getCommentsByUserId(Long userId) {
        List<Comment> comments = commentRepository.findByUserIdAndIsDeletedFalse(userId);

        return comments.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ✅ 중복 제거용 private 메서드
    private CommentResponseDto toDto(Comment comment) {
        return CommentResponseDto.builder()
                .id(comment.getId())
                .userId(comment.getUser().getId())
                .boardId(comment.getBoard().getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .isDeleted(comment.isDeleted())
                .deletedAt(comment.getDeletedAt())
                .build();
    }
}
