#!/usr/bin/env bash
set -eo pipefail

# 0) 포터블 Node.js 설치 (예: Node 20.x)
if [ ! -d "node-v20.8.0-linux-x64" ]; then
  curl -fsSL https://nodejs.org/dist/v20.8.0/node-v20.8.0-linux-x64.tar.xz \
    | tar -xJ
fi
export PATH="$PWD/node-v20.8.0-linux-x64/bin:$PATH"

# 1) 가상환경 확인
if [ ! -f ".venv/bin/activate" ]; then
  echo "ERROR: .venv 가 없습니다. 먼저 가상환경을 생성하세요." >&2
  exit 1
fi

# 가상환경 활성화
. .venv/bin/activate

echo "▶ venv 내부에 pip 설치/업그레이드"
python -m ensurepip --upgrade
python -m pip install --upgrade pip uv

echo "📦 패키지 설치"
uv sync

## 5) MCP 서버 백그라운드 실행
#echo "🚀 MCP 서버 백그라운드 실행"
## npx 는 포터블 Node.js의 bin 에 포함된 것을 사용
#nohup npx -y @playwright/mcp@latest --port 8005 > /dev/null 2>&1 &
#
#echo "▶ setup.sh 완료: MCP 서버가 백그라운드에서 구동 중"