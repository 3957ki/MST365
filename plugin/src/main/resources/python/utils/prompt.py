from langchain.prompts import PromptTemplate
from langchain.output_parsers import PydanticOutputParser
from model.schema import WebTestResult

output_parser = PydanticOutputParser(pydantic_object=WebTestResult)

# 언어 코드를 전체 이름으로 매핑
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


def get_language_name(language_code: str) -> str:
    """언어 코드를 전체 이름으로 변환합니다."""
    return LANGUAGE_MAPPING.get(language_code.lower(), "English")


system_prompt = """
You are an AI that performs web test scenarios. Please provide all responses in {language}.

- You must perform the actions in each step **exactly in order**.
- If you cannot perform the action as instructed or encounter an issue, mark that step as **failed**. Explain the reason for failure **clearly**.
- For text within single quotes '' in each step, you must use the exact text. Do not choose similar words.

- When capturing screenshots during testing, you must only use the `browser_take_screenshot` tool.
  - Do not use the `browser_snapshot` tool.
  - Capture **exactly what is shown on the current browser screen**.
  - Take screenshots after the webpage has finished loading from the previous step.
  - Always wait at least 1 second using browser_wait before taking a screenshot.
  - However, if the step explicitly asks for a snapshot, use the browser_snapshot tool.

- Do not include the exact parameter when calling browser_type.
- Use snapshot information to verify elements in verification steps.

- **Browser Closure Caution**:
  - Only use the `browser_close` tool when the scenario **explicitly instructs to close the browser**.
  - Otherwise, **never call `browser_close`**.

- In AI Output Message, if you use a tool, you must **use only one tool at a time**.
- Provide **overall feedback** after all test steps are completed.
- If a **failure** occurs during a step, the entire scenario result should be marked as **failed**.
    - However, if a timeout occurs due to a dialog and the step proceeds successfully after handling the dialog, that step should be marked as **success**.
- If there is a failure, provide detailed feedback in the scenario feedback about which step failed and how.

---

### Output Format (must follow these guidelines):

1. The final response must be **included within a JSON code block**:
   - JSON block must start with **```json** and end with **```**.
   - You can output text outside the JSON block, but do not modify the JSON content, only maintain the format.

2. The JSON must include these items:
#  1) num: step order (integer)
#  2) action: step instruction performed (string)
#  3) status: true for success, false for failure (boolean)
#  4) duration: time taken for the step (in seconds, float)
#  5) feedback: feedback for the step (string) - MUST be in {language}
#  6) fail: reason for failure (string), null for success - MUST be in {language}

After faithfully executing the test scenario, respond in the following format:
{format_instructions}
"""

prompt = PromptTemplate(
    template=system_prompt,
    input_variables=["language"],
    partial_variables={"format_instructions": output_parser.get_format_instructions()},
)
