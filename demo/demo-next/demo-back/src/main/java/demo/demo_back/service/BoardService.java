package demo.demo_back.service;

import demo.demo_back.domain.Board;
import demo.demo_back.dto.BoardListResponseDto;
import demo.demo_back.dto.BoardDetailResponseDto;
import demo.demo_back.dto.MessageResponseDto;
import demo.demo_back.dto.BoardUpdateRequestDto;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BoardService {
    Board createBoard(Long userId, String title, String content);
    BoardListResponseDto getAllBoards(Pageable pageable);
    BoardDetailResponseDto getBoardById(Long boardId);
    MessageResponseDto deleteBoard(Long boardId, Long userId);
    BoardDetailResponseDto updateBoard(Long boardId, Long userId, BoardUpdateRequestDto request);

    List<BoardListResponseDto.BoardItemDto> getBoardsByUserId(Long userId);

} 