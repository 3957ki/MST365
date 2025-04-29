package demo.demo_back.exception;

public class BoardNotFoundException extends RuntimeException {
    public BoardNotFoundException(String message) {
        super(message);
    }

    public BoardNotFoundException(Long boardId) {
        super("요청하신 게시물 ID(" + boardId + ")에 해당하는 게시물이 존재하지 않거나 이미 삭제되었습니다.");
    }
} 