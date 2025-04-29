import os
import requests
import subprocess
from pathlib import Path
from dotenv import load_dotenv

# .env 로드
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def build_prompt(user_prompt: str) -> str:
    suffix = (
        "\n\n너는 Playwright에 대한 전문가야. 위 내용을 기반으로 Playwright TypeScript 테스트 코드를 작성해줘. 네가 준 테스트 코드로 바로 자동화 테스트를 진행할 거니까 예시 이름과 같은 것은 절대 넣으면 안 돼.\n"
        "- 특정 div이름이라던지 선택자 같은 것은 이름을 알려준 게 아닌 이상 네 마음대로 지정하지 마.\n"
        # "- 만약 내가 준 프롬포트가 구체적이지 않다면 구체적으로 수정한 뒤에 그 프롬포트로 테스트 코드를 작성해줘.\n"
        "- 코드에는 반드시 최상단에 아래 import 문이 있어야 해.\n"
        "  import { test, expect } from '@playwright/test';\n"
        "- 테스트 내용은 test() 함수 안에만 작성해줘.\n"
        "- 함수 안에는 import 문이 없어야 해.\n"
        "- 만약 캡쳐를 해달라는 등 파일을 저장해야 하는 명령이 있다면 테스트가 시작된 시각(대한민국 기준)을 이름으로 해서 'YYYY-MM-DD-HH-MM-SS' 를 형식으로 현재 위치에 새로 폴더를 생성하고 그 폴더 안에다가 파일을 저장하도록 해.\n"
        "- 그리고 버튼을 클릭하거나 텍스트를 입력하라고 할 때는 해당 div나 버튼에 대한 명확한 태그나 이름, 선택자가 주어지지 않으니까 위치 등 명확한 설명이 없어서 다중선택이 될 것 같다면 첫 번째로 감지되는 요소를 선택하게 해.\n"
        "- 설명 없이 코드만 출력해줘."
    )
    return user_prompt.strip() + suffix


def extract_code_only(text: str) -> str:
    """Gemini 응답에서 코드 블록만 추출하고, Playwright 테스트 형식으로 수정"""
    if "```" in text:
        parts = text.split("```")
        for part in parts:
            lines = part.strip().splitlines()
            if not lines:
                continue
            # ```typescript 또는 ```ts 제거
            if lines[0].strip().startswith("typescript") or lines[0].strip().startswith("ts"):
                code = "\n".join(lines[1:])
                if "import " not in code and "test(" not in code:
                    # import가 없고 test도 없을 때만 wrapping
                    code = f"test('자동 생성된 테스트', async ({{page}}) => {{\n{code}\n}});"
                return code
            else:
                return "\n".join(lines)
    return text


def call_gemini(prompt_text):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"

    headers = {'Content-Type': 'application/json'}
    data = {
        "contents": [{
            "parts": [{"text": prompt_text}]
        }]
    }

    response = requests.post(url, headers=headers, json=data)
    if response.status_code != 200:
        raise Exception(f"Gemini API 오류: {response.status_code}, {response.text}")

    result = response.json()
    raw_code = result['candidates'][0]['content']['parts'][0]['text']
    return extract_code_only(raw_code)

def run_llm_test(prompt_file_path):
    with open(prompt_file_path, 'r', encoding='utf-8') as f:
        user_prompt = f.read()

    final_prompt = build_prompt(user_prompt)

    print("🚀 Gemini API에 요청 중...")
    test_code = call_gemini(final_prompt)

    output_path = Path("generated_test.spec.ts")
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(test_code)

    print(f"✅ 테스트 코드 저장 완료: {output_path}")
    print("🧪 Playwright 테스트 실행 중...")

    subprocess.run(["npx.cmd", "playwright", "test", str(output_path), "--reporter", "html"])
    print("📊 테스트 완료. `playwright-report/index.html` 확인")


if __name__ == "__main__":
    run_llm_test("prompts/ssafy.prompt")
