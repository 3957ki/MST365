import asyncio
from datetime import datetime
import json

import argparse
import os
from pydantic import BaseModel
from typing import List, Optional
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from langchain_mcp_adapters.tools import load_mcp_tools
from langgraph.prebuilt import create_react_agent
from langchain_anthropic import ChatAnthropic
from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv

# 환경변수 불러오기
load_dotenv(override=True)

model = ChatAnthropic(model="claude-3-5-haiku-latest", temperature=0, max_tokens=1000)

# 이 파일이 있는 디렉터리(=resources/python) 기준으로 경로 계산
BASE_DIR = os.path.dirname(__file__)
NODE_BIN = os.path.join(BASE_DIR, "node-v20.8.0-linux-x64", "bin", "node")
MCP_DIR  = os.path.join(BASE_DIR, "mcp")  # mcp 패키지가 설치된 디렉터리

print(f"MCP 디렉터리: {MCP_DIR}")

# stdio_client에 넘겨줄 파라미터 정의
server_params = StdioServerParameters(
    command="nohup",              # nohup으로 실행
    args=[NODE_BIN, "cli.js"],    # 뒤에 실제 실행할 node 바이너리와 스크립트
    cwd=MCP_DIR                   # 작업 디렉터리는 mcp 폴더
)

# MCP 서버
# current_file = os.path.abspath(__file__)
# current_dir = os.path.dirname(current_file)
# mcp_path = os.path.join(current_dir, "mcp")
#
# print(mcp_path)
#
# server_params = StdioServerParameters(
#     command="node",
#     args=["cli.js"],
#     cwd=mcp_path,
# )


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

    last_message = agent_response["messages"][-1]
    json_text = last_message.content

    parsed = output_parser.parse(json_text)

    print("시나리오 결과: ", parsed)

    return parsed


# 시나리오 실행 함수 (스크린샷 기능 구현 해야함)
async def run_scenario(agent, scenario: dict, index: int, output_dir: str):
    scenario_dir = os.path.join(output_dir, str(index))
    screenshot_dir = os.path.join(scenario_dir, "screenshots")
    os.makedirs(screenshot_dir, exist_ok=True)

    response = await run_logic(agent, scenario["steps"], screenshot_dir)

    save_result(scenario, response, [], scenario_dir)


# 전체 테스트 실행 함수
async def run_test(scenarios: List[dict], build_num: int, base_dir: str):
    print("테스트 시작")

    # 디렉터리 세팅
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    test_id = f"{timestamp}_report_{build_num}"
    output_dir = os.path.join(base_dir, test_id)
    os.makedirs(output_dir, exist_ok=True)

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            print("ClientSession 시작")
            await session.initialize()
            print("session initialize 끝 ", session)
            tools = await load_mcp_tools(session)
            print("mcp 준비완료: ", tools)

            for idx, scenario in enumerate(scenarios, 1):
                agent = create_react_agent(model, tools)
                await run_scenario(agent, scenario, idx, output_dir)

            print(f"모든 테스트 완료: {output_dir}")


# main 함수
if __name__ == "__main__":
    print("시작")

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

    # 파일 읽기
    with open(args.file, "r", encoding="utf-8") as f:
        data = json.load(f)
    scenarios = data.get("scenarios", [])

    # 사용자로부터 시나리오, 빌드 넘버, 루트 디렉터리를 파라미터로 받기
    asyncio.run(run_test(scenarios, build_num=args.build, base_dir=args.output_dir))