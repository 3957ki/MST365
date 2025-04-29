package demo.demo_back.service.impl;

import demo.demo_back.domain.Board;
import demo.demo_back.domain.User;
import demo.demo_back.repository.BoardRepository;
import demo.demo_back.repository.UserRepository;
import demo.demo_back.service.BoardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
} 