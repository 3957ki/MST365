package demo.demo_back.exception;

public class UnauthorizedAccessException extends RuntimeException {
    public UnauthorizedAccessException(String message) {
        super(message);
    }

    public UnauthorizedAccessException() {
        super("이 게시물을 삭제할 권한이 없습니다. 본인이 작성한 게시물만 삭제할 수 있습니다.");
    }
} 