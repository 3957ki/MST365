#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os

def process(input_str: str) -> str:
    val = input_str.strip().upper()
    # …여기에 원래 복잡한 로직을 대신 구현하세요
    return f"Processed({val})"

def main():
    # 1) 입력 읽기
    if len(sys.argv) > 1:
        inp = sys.argv[1]
    else:
        inp = sys.stdin.read()

    # 2) 처리
    result = process(inp)

    # 3) 필수 환경변수로 BUILD_NUMBER 확인
    build_no = os.environ.get('BUILD_NUMBER')
    if not build_no:
        sys.stderr.write("ERROR: BUILD_NUMBER not set\n")
        sys.exit(1)

    # 4) 파일 생성 위치 결정
    jenkins_home = os.environ.get('JENKINS_HOME') or os.getcwd()
    report_dir = os.path.join(jenkins_home, 'mcp_report')
    os.makedirs(report_dir, exist_ok=True)

    # 5) 결과 파일명 (항상 BUILD_NUMBER 기반)
    filename = f"result{build_no}.txt"
    filepath = os.path.join(report_dir, filename)

    # 6) 파일에 쓰기 (UTF-8)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(result)

    # 7) stdout에도 결과를 출력
    print(result)

if __name__ == "__main__":
    main()
