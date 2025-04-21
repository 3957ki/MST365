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

uv pip install -r requirements.txt
```

### 🔐 .env 파일 설정

`.env` 파일에 다음과 같이 사용할 LLM API Key를 추가하세요.
필요한 키만 작성하면 됩니다.

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

### ⚠️ Jenkins Pipeline 관련 이슈

- Jenkins 컨테이너 내에서 직접 명령어로 실행하면 정상 작동합니다.
- 그러나 Jenkins Pipeline을 통해 MCP 서버를 백그라운드로 실행할 경우 종료되는 문제가 발생합니다.
- 현재 Jenkins Plugin 내부에서 MCP 서버를 직접 실행하는 방식을 테스트 중입니다.
- 그리고 메인 로직에서는 테스트 결과만 응답하고, html은 plugin에서 만드는게 좀 더 유연할 것 같습니다.
