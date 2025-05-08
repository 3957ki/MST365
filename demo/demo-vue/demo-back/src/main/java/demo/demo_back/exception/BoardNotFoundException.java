package demo.demo_back.exception;

public class BoardNotFoundException extends RuntimeException {

    // 기본 메시지 생성자
    public BoardNotFoundException() {
        super("게시물을 찾을 수 없습니다.");
    }

    // 커스텀 메시지 생성자
    public BoardNotFoundException(String message) {
        super(message);
    }

    // boardId 기반 메시지 생성자
    public BoardNotFoundException(Long boardId) {
        super("요청하신 게시물 ID(" + boardId + ")에 해당하는 게시물이 존재하지 않거나 이미 삭제되었습니다.");
    }
}
