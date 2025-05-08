import asyncio
from datetime import datetime
import json
import argparse
import os
import base64
from pydantic import BaseModel
from typing import List, Optional
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from langchain_mcp_adapters.tools import load_mcp_tools
from langgraph.prebuilt import create_react_agent
from langchain_core.messages import ToolMessage
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import PromptTemplate
from langchain_core.messages import AIMessage
from dotenv import load_dotenv


# Output Parser
class FailedStep(BaseModel):
    num: int
    message: str


class WebTestResult(BaseModel):
    title: str
    status: bool
    duration: float
    feedback: str
    fail: Optional[List[FailedStep]]


output_parser = PydanticOutputParser(pydantic_object=WebTestResult)

# 프롬프트
system_prompt = """너는 아래 시나리오를 테스트하는 AI야.
각 스텝에서 시키는 대로 행동하고, 실패한 스텝과 이유를 한글로 기록해.
스텝에서 시키는 대로 할 수 없거나, 시킨 대로 한 결과가 이상하면 실패로 처리해.
모든 스텝이 끝난 뒤엔 전체 피드백을 주고, 반드시 아래 형식 그대로 응답해야 해.

특히 스크린샷을 캡쳐할 땐 반드시 snapshot을 먼저 만들어야 해.  
즉, navigate 이후 바로 take_screenshot을 실행하면 안 되고,  
반드시 snapshot → take_screenshot 순서로 실행해야 해.

최종 JSON은 반드시 아래처럼 **```json 코드블럭 안에만** 포함시켜야 해.
다른 설명은 JSON 블럭 바깥에 써도 되지만, JSON 그 자체는 무조건 ```json 으로 감싸야 해.

{format_instructions}
"""


prompt = PromptTemplate(
    template=system_prompt,
    input_variables=[],
    partial_variables={"format_instructions": output_parser.get_format_instructions()},
)


# 결과 저장 함수
def save_result(
    scenario: dict, result: dict, screenshots: List[str], scenario_dir: str
):
    result_json = {
        "title": scenario["title"],
        "status": result.status,
        "duration": result.duration,
        "feedback": result.feedback,
        "fail": [f.model_dump() for f in result.fail] if result.fail else None,
        "screenshots": screenshots,
    }
    with open(os.path.join(scenario_dir, "result.json"), "w", encoding="utf-8") as f:
        json.dump(result_json, f, ensure_ascii=False, indent=2)


# Step 직렬화 함수
def create_instruction(steps: List[str]) -> str:
    return "\n".join(f"{i+1}. {step}" for i, step in enumerate(steps))


# json만 가져오기
def extract_json_from_message(msg: AIMessage) -> str:
    contents = msg.content
    if isinstance(contents, list):
        full_text = ""
        for part in contents:
            if isinstance(part, dict) and "text" in part:
                full_text += part["text"]
            elif isinstance(part, str):
                full_text += part
        return extract_json_block(full_text)
    elif isinstance(contents, str):
        return extract_json_block(contents)
    raise ValueError("AIMessage.content 구조를 파싱할 수 없습니다.")


def extract_json_block(text: str) -> str:
    import re

    match = re.search(r"```json\s*(.*?)\s*```", text, re.DOTALL)
    if match:
        return match.group(1)
    raise ValueError("JSON 블럭을 찾을 수 없습니다.")


# llm 요청 함수
async def run_logic(agent, steps: List[str], screenshot_dir: str):
    agent_response = await agent.ainvoke(
        {
            "messages": [
                {"role": "system", "content": prompt.format()},
                {"role": "user", "content": create_instruction(steps)},
            ]
        }
    )

    # 스크린샷 저장
    image_count = 1
    saved_screenshot_files = []

    for event in agent_response["messages"]:
        # 바로 event에서 ToolMessage 여부 검사
        if isinstance(event, ToolMessage) and getattr(event, "artifact", None):
            for artifact in event.artifact:
                if getattr(artifact, "type", "") == "image" and hasattr(
                    artifact, "data"
                ):
                    filename = f"{image_count}.png"
                    filepath = os.path.join(screenshot_dir, filename)
                    with open(filepath, "wb") as f:
                        f.write(base64.b64decode(artifact.data))
                    saved_screenshot_files.append(filename)
                    print(f"스크린샷 저장됨: {filename}")
                    image_count += 1

    last_message = agent_response["messages"][-1]
    json_text = extract_json_from_message(last_message)

    parsed = output_parser.parse(json_text)

    return parsed, saved_screenshot_files


# 시나리오 실행 함수
async def run_scenario(agent, scenario: dict, index: int, output_dir: str):
    scenario_dir = os.path.join(output_dir, str(index))
    screenshot_dir = os.path.join(scenario_dir, "screenshots")
    os.makedirs(screenshot_dir, exist_ok=True)

    response, screenshots = await run_logic(agent, scenario["steps"], screenshot_dir)
    save_result(scenario, response, screenshots, scenario_dir)


# 전체 테스트 실행 함수
async def run_test(
    scenarios: List[dict],
    build_num: int,
    base_dir: str,
    provider: str,
    llm_model: str,
    api_key: str,
):
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    test_id = f"{timestamp}_report_{build_num}"
    output_dir = os.path.join(base_dir, test_id)
    os.makedirs(output_dir, exist_ok=True)

    if provider == "anthropic":
        model = ChatAnthropic(
            model=llm_model, temperature=0, max_tokens=1000, api_key=api_key
        )
    elif provider == "openai":
        model = ChatOpenAI(
            model=llm_model, temperature=0, max_tokens=1000, api_key=api_key
        )
    else:
        raise ValueError(f"지원되지 않는 provider: {provider}")

    current_file = os.path.abspath(__file__)
    current_dir = os.path.dirname(current_file)
    mcp_path = os.path.join(current_dir, "mcp")

    server_params = StdioServerParameters(command="node", args=["cli.js"], cwd=mcp_path)

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools = await load_mcp_tools(session)

            for idx, scenario in enumerate(scenarios, 1):
                agent = create_react_agent(model, tools)
                await run_scenario(agent, scenario, idx, output_dir)

            print(f"모든 테스트 완료: {output_dir}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--build", type=int, required=True, help="빌드 번호")
    parser.add_argument(
        "--output_dir", type=str, default="./results", help="결과 저장 디렉토리"
    )
    parser.add_argument(
        "--file", type=str, required=True, help="시나리오 JSON 파일 경로"
    )
    args = parser.parse_args()

    # 환경변수 불러오기
    load_dotenv()

    provider = os.getenv("LLM_PROVIDER")
    llm_model = os.getenv("LLM_MODEL")
    api_key = os.getenv("LLM_API_KEY")

    # 시나리오 로드
    with open(args.file, "r", encoding="utf-8") as f:
        data = json.load(f)
    scenarios = data.get("scenarios", [])

    asyncio.run(
        run_test(scenarios, args.build, args.output_dir, provider, llm_model, api_key)
    )
