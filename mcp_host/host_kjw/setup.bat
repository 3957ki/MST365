@echo off
chcp 65001 > nul
SETLOCAL

echo 🚀 uv 설치
pip install uv

echo 🐍 가상환경 생성 (Python 3.12)
uv venv --python 3.12

echo ✅ 가상환경 활성화
call .venv\Scripts\activate.bat

echo 📦 패키지 설치
uv pip install -r requirements.txt

echo 🚀 MCP 서버 실행
npx @playwright/mcp@latest --port 8005

ENDLOCAL
