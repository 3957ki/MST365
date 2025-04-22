import os
import openai
import subprocess
from pathlib import Path
from dotenv import load_dotenv
import datetime

# .env 로드
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MODEL_NAME = "gpt-4o" # 또는 다른 적절한 모델 이름

def build_prompt(user_prompt: str) -> str:
    suffix = (
        "\n\n너는 Playwright에 대한 전문가야. 위 내용을 기반으로 Playwright TypeScript 테스트 코드를 작성해줘. 네가 준 테스트 코드로 바로 자동화 테스트를 진행할 거니까 예시 이름과 같은 것은 절대 넣으면 안 돼.\n"
        "- 특정 div이름이라던지 선택자 같은 것은 이름을 알려준 게 아닌 이상 네 마음대로 지정하지 마.\n"
        "- 만약 내가 준 프롬포트가 구체적이지 않다면 구체적으로 수정한 뒤에 그 프롬포트로 테스트 코드를 작성해줘.\n"
        "- 코드에는 반드시 최상단에 아래 import 문이 있어야 해.\n"
        "  import { test, expect } from '@playwright/test';\n"
        "- 테스트 내용은 test() 함수 안에만 작성해줘.\n"
        "- 함수 안에는 import 문이 없어야 해.\n"
        "- 만약 캡쳐를 해달라는 명령이 있다면 테스트가 시작된 시각(대한민국 기준)을 이름으로 해서 'YYYY-MM-DD-HH-MM-SS' 를 형식으로 새로 폴더를 생성하고 그 폴더 안에다가 파일을 저장하도록 해.\n"
        "- 설명 없이 코드만 출력해줘."
    )
    return user_prompt.strip() + suffix


def extract_code_only(text: str) -> str:
    """GPT 응답에서 코드 블록만 추출하고, Playwright 테스트 형식으로 수정"""
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


def call_openai(prompt_text):
    openai.api_key = OPENAI_API_KEY
    try:
        response = openai.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "user", "content": prompt_text}
            ]
        )
        raw_code = response.choices[0].message.content
        return extract_code_only(raw_code)
    except openai.error.OpenAIError as e:
        print(f"OpenAI API 오류: {e}")
        return ""

def run_llm_test(prompt_file_path):
    with open(prompt_file_path, 'r', encoding='utf-8') as f:
        user_prompt = f.read()

    final_prompt = build_prompt(user_prompt)

    print("🚀 OpenAI API에 요청 중...")
    test_code = call_openai(final_prompt)

    if test_code:
        timestamp = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9))).strftime('%Y-%m-%d-%H-%M-%S')
        screenshots_dir = Path(__file__).parent / "screenshots" / timestamp
        screenshots_dir.mkdir(parents=True, exist_ok=True)

        output_path = Path("generated_test.spec.ts")
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(test_code.replace("screenshotDir", f"'{screenshots_dir}'")) # screenshotDir 변수를 실제 경로로 대체

        print(f"✅ 테스트 코드 저장 완료: {output_path}")
        print("🧪 Playwright 테스트 실행 중...")

        subprocess.run(["npx.cmd", "playwright", "test", str(output_path), "--reporter", "html"])
        print("📊 테스트 완료. `playwright-report/index.html` 확인")
    else:
        print("❌ OpenAI API 응답이 없습니다.")


if __name__ == "__main__":
    run_llm_test("prompts/ssafy.prompt")