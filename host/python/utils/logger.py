import logging


def setup_logger() -> logging.Logger:
    """
    로거를 설정하고 반환합니다.

    Returns:
        logging.Logger: 설정된 로거 인스턴스
    """
    logger = logging.getLogger("web_test")
    logger.setLevel(logging.INFO)

    # 로그 포맷 설정
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    # 콘솔 핸들러 추가
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    return logger
