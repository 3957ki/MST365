import sys

def process(input_str: str) -> str:
    val = input_str.strip().upper()
    # …여기에 원래 복잡한 로직을 대신 구현하세요
    return f"Processed({val})"

def main():
    # 커맨드라인 인자로 받거나 stdin 으로 읽기
    if len(sys.argv) > 1:
        inp = sys.argv[1]
    else:
        inp = sys.stdin.read()
    result = process(inp)
    print(result)

if __name__ == "__main__":
    main()
