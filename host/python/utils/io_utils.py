import re
import json
import os
import shutil
from langchain_core.messages import AIMessage
from model.schema import WebTestResult
from typing import List


def extract_json_block(text: str) -> str:
    match = re.search(r"```json\s*(.*?)\s*```", text, re.DOTALL)
    if match:
        return match.group(1)
    raise ValueError("JSON 블럭을 찾을 수 없습니다.")


def extract_json_from_message(msg: AIMessage) -> str:
    contents = msg.content
    if isinstance(contents, list):
        full = ""
        for part in contents:
            if isinstance(part, dict) and "text" in part:
                full += part["text"]
            elif isinstance(part, str):
                full += part
        return extract_json_block(full)
    elif isinstance(contents, str):
        return extract_json_block(contents)
    raise ValueError("AIMessage.content 구조를 파싱할 수 없습니다.")


def save_result(
    scenario: dict, result: WebTestResult, screenshots: List[str], scenario_dir: str
):
    payload = {
        "title": scenario.get("title", ""),
        "status": result.status,
        "duration": result.duration,
        "feedback": result.feedback,
        "fail": [f.model_dump() for f in result.fail] if result.fail else None,
        "screenshots": screenshots,
    }
    with open(os.path.join(scenario_dir, "result.json"), "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
