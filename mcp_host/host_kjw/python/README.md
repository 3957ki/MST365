## 🚀 MCP 서버 실행 및 설정 가이드

본 문서는 Playwright MCP 서버 환경을 빠르게 설정하고 실행하기 위한 가이드입니다.

### 📦 사전 설치

다음 항목들이 설치되어 있어야 합니다:

- Python 3.12
- Node.js (최신 권장)

### ⚙️ 환경 설정

#### 1. 자동 설정 (setup.bat)

- setup.bat 실행 시, MCP 서버 실행을 위한 환경이 자동으로 구성됩니다.

#### 2. 수동 설정

- 직접 환경을 구성하려면 아래 명령어를 참고하세요.

```bash

# uv 설치

pip install uv

# Python 3.12 기반 가상환경 생성

uv venv --python 3.12

# 가상환경 활성화 (Windows)

call .venv\Scripts\activate.bat

# 필요한 패키지 설치

uv sync
```

### 🔐 .env 파일 설정

`.env` 파일에 다음과 같이 사용할 LLM API Key를 추가하세요.
필요한 키만 작성하면 됩니다. (현재 Claude 사용중입니다.)

```bash
ANTHROPIC_API_KEY={Claude Key}
OPENAI_API_KEY={GPT Key}
```

- 지원 모델 목록:
  **Claude:** claude-3-7-sonnet-latest, claude-3-5-sonnet-latest, claude-3-haiku-latest
  **GPT:** gpt-4o, gpt-4o-mini

### 🧪 Playwright MCP 서버 실행

다음 명령어로 MCP 서버를 실행합니다:

```bash
npx @playwright/mcp@latest --port 8005
```

서버는 기본적으로 http://localhost:8005에서 실행됩니다.

### 테스트 방법

- Linux

```
. .venv/bin/activate
python run_test.py --file {시나리오 경로}
```

- Window

```
call .venv\Scripts\activate
python run_test.py --file {시나리오 경로}
```
