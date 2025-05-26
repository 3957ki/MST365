## 🚀 Main Logic 가이드

본 문서는 자동화 테스트 Main Logic 플러그인의 사용 환경을 설정하고 실행하기 위한 가이드입니다.

### 📦 사전 설치

다음 항목들이 설치되어 있어야 합니다:

- Python (3.12 권장)
- Node.js (최신버전)
- Chromium

### ⚙️ 환경 설정

- 플러그인 설치 후 환경을 구성하세요

```bash
# uv 설치
pip install uv

# 가상환경 및 필요한 패키지 설치
uv sync

# npm install
cd mcp
npm install
cd ..
```

### .env 파일 생성

```
LLM_PROVIDER={openai 혹은 anthropic}
LLM_MODEL={사용할 모델}
LLM_API_KEY={API 키}
```

- 지원 모델 목록:
  **Claude:** claude-3-7-sonnet-latest, claude-3-5-sonnet-latest, claude-3-5-haiku-latest
  **GPT:** gpt-4o, gpt-4o-mini

### 테스트 방법

- 가상환경 활성화 후 실행

```
python .\main.py --build {빌드 번호} --file {사용자 시나리오 json 경로} --output_dir {결과 저장 경로} --language {응답 언어}
```

- 응답 언어 목록

```
LANGUAGE_MAPPING = {
    "en": "English",
    "ko": "Korean",
    "ja": "Japanese",
    "zh": "Chinese",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "ru": "Russian",
    "pt": "Portuguese",
    "it": "Italian",
}
```
