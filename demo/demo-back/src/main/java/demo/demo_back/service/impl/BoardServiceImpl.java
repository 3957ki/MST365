package demo.demo_back.service.impl;

import demo.demo_back.domain.Board;
import demo.demo_back.domain.User;
import demo.demo_back.dto.BoardListResponseDto;
import demo.demo_back.dto.BoardDetailResponseDto;
import demo.demo_back.exception.BoardNotFoundException;
import demo.demo_back.repository.BoardRepository;
import demo.demo_back.repository.UserRepository;
import demo.demo_back.service.BoardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public BoardListResponseDto getAllBoards() {
        List<Board> boards = boardRepository.findAllByIsDeletedFalseOrderByCreatedAtDesc();
        
        List<BoardListResponseDto.BoardItemDto> boardItems = boards.stream()
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
    @Transactional
    public BoardDetailResponseDto getBoardById(Long boardId) {
        // 게시물 조회 및 존재 여부 확인
        Board board = boardRepository.findByIdAndIsDeletedFalse(boardId)
                .orElseThrow(() -> new BoardNotFoundException(boardId));

        // 조회수 증가
        board.setView(board.getView() + 1);
        boardRepository.save(board);

        // DTO 변환 및 반환
        BoardDetailResponseDto.BoardDetailDto detailDto = new BoardDetailResponseDto.BoardDetailDto(
                board.getId(),
                board.getUser().getId(),
                board.getTitle(),
                board.getContent(),
                board.getView(),
                board.getCreatedAt(),
                board.getUpdatedAt(),
                board.isDeleted(),
                board.getDeletedAt()
        );

        return new BoardDetailResponseDto("게시물 상세 정보를 성공적으로 조회했습니다.", detailDto);
    }
} 