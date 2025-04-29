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
python main_logic.py --file {시나리오 경로} --build {빌드 넘버} --output_dir {결과가 저장될 base directory}
```

- Window

```
call .venv\Scripts\activate
python main_logic.py --file {시나리오 경로} --build {빌드 넘버} --output_dir {결과가 저장될 base directory}
```

### 토큰 문제 개선에 관한 고찰

light한 mcp 서버 하나를 가지고 테스트를 해봤다.
sse와 stdio 방식으로 했을때 토큰차이가 있을까? 결과는 완전 동일했다.
지금 playwright mcp는 sse만 지원이 되는데 이걸 굳이 stdio로 바꿀 필요는 없어 보인다.
light한 mcp서버 하나를 썼을때 정말 간단한 질문이었지만 900토큰 가량 소모했다.
create_react_agent로 테스트하는게 토큰소모가 그냥 큰거같다.
하지만 이걸 안쓸수는 없다.

python이 문제인가 싶어 typescript로도 했으나 결과는 동일했다.

playwright mcp에 있는 툴들이 10개 가량있는데 여기서 몇개를 제외할 수 도 없다. 테스트할때 무슨 툴이 쓰일지 모르기때문.

하나 확실한건 react agent를 사용할때 굳이 teddy note버전의 astream_graph 함수를 사용할 필요는 없다.
ainvoke나 invoke를 사용해도 되더라.

커스텀 프롬프팅을 아예 사용 안해봤지만 결과는 미미했다.
내가 쓴 프롬프팅 문제는 아닌것 같다.
일단 기본적으로 확실히 토큰소모가 큰 편으로 시작이된다. 기본으로 1000이 넘어간다. 이것만으로도 사실 부담스럽다.
근데 중요한건 웹사이트를 방문했을때 mcp가 html 정보를 긁어서 return하는것 같다.
여기서 input token이 폭발한다.
기본 10000을 넘어간다.
그렇다고 html을 안넘길수는 없다. html을 보고 다음 동작을 어떻게 할지 정해야하기 때문.

지금 최선은 이 html중에서 필요없는 부분을 빼고보내는것이다.
generic, ref와 같은 태그들은 필요없어보였다.
이걸 수정하려면 npx로 mcp 서버를 띄우는게 아니라 직접 커스텀해서 띄워야한다.

이건 최후의 수단인 것 같다. 다른 방법을 계속 고민해보겠다.

근데 그냥 claude desktop을 사용해서 테스트해도 비슷하게 토큰이 들까?
테스트를 해봤지만 토큰을 확인할 길이 없었다.
근데 상당히 오래걸리는것으로 보아 비슷하다고 생각된다.

모델은 3.5 haiku로 바꿔보았다.
저렴한 모델이라 될까 싶었지만 단순한 테스트라 되더라.
사용하는 토큰은 비슷했지만 가격이 엄청 저렴했다.
10000토큰에 0.01 정도였다.
이러면 10만토큰을 쓴다고해도 0.1달러니까 크게 나쁘지 않을 수 있겠다.

이번엔 gpt-4o-mini를 써봤다.
이건 의외로 훨씬 괜찮았다.
같은 코드로 실행했지만 사용한 토큰이 절반정도이며 가격도 약 7배정도 저렴했다.
일단 이 모델이 최선이다.
