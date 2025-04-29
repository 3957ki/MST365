#!/usr/bin/env python3
import os
import sys
import json
import base64
import argparse
import asyncio

from datetime import datetime
from typing import List, Optional, Any, Dict

from dotenv import load_dotenv
from pydantic import BaseModel
from langchain.prompts import PromptTemplate
from langchain.output_parsers import PydanticOutputParser
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import ToolMessage
from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.prebuilt import create_react_agent
from langchain_core.runnables import Runnable
from utils import astream_graph

# 환경변수 불러오기
load_dotenv(override=True)

# 모델 세팅
model = ChatAnthropic(model="claude-3-5-haiku-latest", temperature=0, max_tokens=1000)

# 결과 파서
class FailedStep(BaseModel):
    num: int
    message: str

class WebTestResult(BaseModel):
    status: bool
    duration: Optional[float]
    feedback: str
    fail: Optional[List[FailedStep]]

parser = PydanticOutputParser(pydantic_object=WebTestResult)

summary_prompt = PromptTemplate(
    template="""
너는 웹 테스트 요약을 작성하는 어시스턴트입니다.

다음은 테스트 결과입니다:
{raw_result}

이 결과를 다음 JSON 포맷으로 요약해줘:
{format_instructions}
""".strip(),
    input_variables=["raw_result"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)
summary_chain: Runnable = summary_prompt | model | parser

DEFAULT_RESULT_STEP = "성공 여부, 속도, 피드백을 포함해 결과를 요약한다."

# 콜백 정의
def handle_callback(
        event: Dict[str, Any],
        screenshot_dir: str,
        screenshot_files: List[str],
        collected_logs: List[str],
):
    content = event.get("content")
    if isinstance(content, ToolMessage) and getattr(content, "artifact", None):
        for artifact in content.artifact:
            if getattr(artifact, "type", "") == "image" and hasattr(artifact, "data"):
                filename = f"{len(screenshot_files)+1}.png"
                filepath = os.path.join(screenshot_dir, filename)
                with open(filepath, "wb") as f:
                    f.write(base64.b64decode(artifact.data))
                screenshot_files.append(filename)
                print(f"📸 스크린샷 저장됨: {filename}")
    else:
        text = getattr(content, "content", str(content))
        if isinstance(text, list):
            collected_logs.extend(str(t) for t in text)
        else:
            collected_logs.append(str(text))

# MCP 실행 + 콜백 수집
def create_instruction(steps: List[str]) -> str:
    return "\n".join(
        f"{i+1}. {step}" for i, step in enumerate(steps + [DEFAULT_RESULT_STEP])
    )

async def run_with_callback(agent, steps: List[str], screenshot_dir: str):
    collected_logs: List[str] = []
    screenshot_files: List[str] = []
    instruction = create_instruction(steps)

    await astream_graph(
        agent,
        inputs={"messages": instruction},
        stream_mode="messages",
        callback=lambda event: handle_callback(
            event, screenshot_dir, screenshot_files, collected_logs
        ),
    )

    return screenshot_files, "\n".join(collected_logs)

# 요약
async def summarize_result(raw_text: str) -> WebTestResult:
    return await summary_chain.ainvoke({"raw_result": raw_text})

# 결과 저장
def save_result(
        scenario: dict, result: WebTestResult, screenshots: List[str], scenario_dir: str
):
    result_json = {
        "title": scenario.get("title"),
        "status": result.status,
        "duration": result.duration,
        "feedback": result.feedback,
        "fail": [f.model_dump() for f in result.fail] if result.fail else None,
        "screenshots": screenshots,
    }
    os.makedirs(scenario_dir, exist_ok=True)
    with open(os.path.join(scenario_dir, "result.json"), "w", encoding="utf-8") as f:
        json.dump(result_json, f, ensure_ascii=False, indent=2)

# 시나리오 실행
async def run_scenario(agent, scenario: dict, index: int, output_dir: str):
    scenario_dir = os.path.join(output_dir, str(index))
    screenshot_dir = os.path.join(scenario_dir, "screenshots")
    os.makedirs(screenshot_dir, exist_ok=True)

    screenshots, log_text = await run_with_callback(
        agent, scenario.get("steps", []), screenshot_dir
    )

    summary = await summarize_result(log_text)
    save_result(scenario, summary, screenshots, scenario_dir)

# 메인 테스트 함수
async def run_test(scenarios: List[dict], build_num: int, base_dir: str):
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    test_id = f"{timestamp}_report_{build_num}"
    output_dir = os.path.join(base_dir, test_id)
    os.makedirs(output_dir, exist_ok=True)

    async with MultiServerMCPClient(
            {
                "playwright": {
                    "url": "http://localhost:8005/sse",
                    "transport": "sse",
                }
            }
    ) as client:
        tools = client.get_tools()
        for idx, scenario in enumerate(scenarios, start=1):
            agent = create_react_agent(model, tools)
            await run_scenario(agent, scenario, idx, output_dir)

    print(f"모든 테스트 완료: {output_dir}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--file", type=str, required=True, help="시나리오 JSON 파일 경로"
    )
    parser.add_argument("--build", type=int, required=True, help="빌드 번호")
    parser.add_argument(
        "--output_dir",
        type=str,
        default="./results",
        help="결과가 저장될 Base Directory",
    )
    args = parser.parse_args()

    # 파일 읽기: {"title": "...", "scenarios": [ {...}, {...} ]}
    with open(args.file, "r", encoding="utf-8") as f:
        data = json.load(f)
    scenarios = data.get("scenarios", [])

    # 시나리오 처리
    asyncio.run(run_test(scenarios, build_num=args.build, base_dir=args.output_dir))
