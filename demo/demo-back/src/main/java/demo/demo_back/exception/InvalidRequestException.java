package demo.demo_back.exception;

public class InvalidRequestException extends RuntimeException {
    public InvalidRequestException(String message) {
        super(message);
    }

    public InvalidRequestException() {
        super("제목이나 내용 중 최소한 하나는 유효한 값이어야 합니다.");
    }
} 