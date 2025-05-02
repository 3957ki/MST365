package demo.demo_back.service.impl;

import demo.demo_back.domain.Board;
import demo.demo_back.domain.User;
import demo.demo_back.dto.BoardListResponseDto;
import demo.demo_back.dto.BoardDetailResponseDto;
import demo.demo_back.dto.MessageResponseDto;
import demo.demo_back.dto.BoardUpdateRequestDto;
import demo.demo_back.exception.BoardNotFoundException;
import demo.demo_back.exception.UnauthorizedAccessException;
import demo.demo_back.exception.InvalidRequestException;
import demo.demo_back.repository.BoardRepository;
import demo.demo_back.repository.UserRepository;
import demo.demo_back.service.BoardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class BoardServiceImpl implements BoardService {

    private final BoardRepository boardRepository;
    private final UserRepository userRepository;

    @Autowired
    public BoardServiceImpl(BoardRepository boardRepository, UserRepository userRepository) {
        this.boardRepository = boardRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Board createBoard(Long userId, String title, String content) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Board board = new Board();
        board.setTitle(title);
        board.setContent(content);
        board.setUser(user);

        return boardRepository.save(board);
    }

    @Override
    @Transactional(readOnly = true)
    public BoardListResponseDto getAllBoards(Pageable pageable) {
        Page<Board> boardPage = boardRepository.findAllByIsDeletedFalseOrderByCreatedAtDesc(pageable);

        List<BoardListResponseDto.BoardItemDto> boardItems = boardPage.getContent().stream()
                .map(board -> new BoardListResponseDto.BoardItemDto(
                        board.getId(),
                        board.getUser().getId(),
                        board.getTitle(),
                        board.getView(),
                        board.getCreatedAt()
                ))
                .collect(Collectors.toList());

        return new BoardListResponseDto("게시물 목록을 성공적으로 조회했습니다.", boardItems);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BoardListResponseDto.BoardItemDto> getBoardsByUserId(Long userId) {
        List<Board> boards = boardRepository.findByUserIdAndIsDeletedFalse(userId);

        return boards.stream()
                .map(board -> new BoardListResponseDto.BoardItemDto(
                        board.getId(),
                        board.getUser().getId(),
                        board.getTitle(),
                        board.getView(),
                        board.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BoardDetailResponseDto getBoardById(Long boardId) {
        Board board = boardRepository.findByIdAndIsDeletedFalse(boardId)
                .orElseThrow(() -> new BoardNotFoundException(boardId));

        board.setView(board.getView() + 1);
        boardRepository.save(board);

        return new BoardDetailResponseDto("게시물 상세 정보를 성공적으로 조회했습니다.",
                new BoardDetailResponseDto.BoardDetailDto(
                        board.getId(),
                        board.getUser().getId(),
                        board.getTitle(),
                        board.getContent(),
                        board.getView(),
                        board.getCreatedAt(),
                        board.getUpdatedAt(),
                        board.isDeleted(),
                        board.getDeletedAt()
                ));
    }

    @Override
    @Transactional
    public MessageResponseDto deleteBoard(Long boardId, Long userId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new BoardNotFoundException(boardId));

        if (board.isDeleted()) {
            throw new BoardNotFoundException(boardId);
        }

        if (!board.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException();
        }

        board.setDeleted(true);
        board.setDeletedAt(LocalDateTime.now());
        boardRepository.save(board);

        return new MessageResponseDto("게시물이 성공적으로 삭제되었습니다.");
    }

    @Override
    @Transactional
    public BoardDetailResponseDto updateBoard(Long boardId, Long userId, BoardUpdateRequestDto request) {
        if (!request.isValid()) {
            throw new InvalidRequestException();
        }

        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new BoardNotFoundException(boardId));

        if (board.isDeleted()) {
            throw new BoardNotFoundException(boardId);
        }

        if (!board.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException();
        }

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            board.setTitle(request.getTitle().trim());
        }
        if (request.getContent() != null && !request.getContent().trim().isEmpty()) {
            board.setContent(request.getContent().trim());
        }

        boardRepository.save(board);

        return new BoardDetailResponseDto(
                "게시물이 성공적으로 수정되었습니다.",
                new BoardDetailResponseDto.BoardDetailDto(
                        board.getId(),
                        board.getUser().getId(),
                        board.getTitle(),
                        board.getContent(),
                        board.getView(),
                        board.getCreatedAt(),
                        board.getUpdatedAt(),
                        board.isDeleted(),
                        board.getDeletedAt()
                )
        );
    }
}
