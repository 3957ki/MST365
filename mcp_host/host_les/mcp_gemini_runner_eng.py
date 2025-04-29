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
        "\n\nYou are an expert in Playwright. Based on the content above, write Playwright TypeScript test code."
        " This test code will be used for actual automation testing, so do NOT include placeholder names like 'example'.\n"
        "- Do NOT make up arbitrary names for elements like divs or selectors unless I’ve explicitly provided them.\n"
        "- If the given prompt is not specific enough, revise it to be more concrete first, then write the test code based on that.\n"
        "- The following import statement must be included at the very top of the code:\n"
        "  import { test, expect } from '@playwright/test';\n"
        "- The test logic must be written inside the test() function only.\n"
        "- Do NOT include any import statements inside the function.\n"
        "- If there’s a request to capture a screenshot, create a new folder named with the current time in Korea Standard Time"
        " using the format 'YYYY-MM-DD-HH-MM-SS', and save the file inside that folder.\n"
        "- If there’s a request to input text and no specific selector or location is provided,"
        " enter text into the input fields in order starting from the first one.\n"
        "- Only output the code. Do not include any explanations."
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
