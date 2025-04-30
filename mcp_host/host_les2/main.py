import os
from dotenv import load_dotenv
from src.lang_graph import process_scenario
from src.executor_node import execute_step

# 환경 변수 로드
load_dotenv()
API_KEY = os.getenv("ANTHROPIC_API_KEY")

if __name__ == "__main__":
    # 시나리오 파일 읽기
    with open("scenarios/test_scenario.txt", "r", encoding="utf-8") as f:
        scenario_text = f.read()

    # LangGraph를 통해 시나리오 처리
    steps = process_scenario(scenario_text)

    # 각 단계를 실행
    for step in steps:
        print(f"Executing Step {step['step']}: {step['description']}")
        execute_step(step)
