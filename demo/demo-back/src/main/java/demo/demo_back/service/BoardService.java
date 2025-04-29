package demo.demo_back.service;

import demo.demo_back.domain.Board;
import demo.demo_back.dto.BoardListResponseDto;
import demo.demo_back.dto.BoardDetailResponseDto;

public interface BoardService {
    Board createBoard(Long userId, String title, String content);
    BoardListResponseDto getAllBoards();
    BoardDetailResponseDto getBoardById(Long boardId);
} 