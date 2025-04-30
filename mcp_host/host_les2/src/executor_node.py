import subprocess

def execute_step(step):
    # 각 단계를 실행하는 함수 (예: Playwright 스크립트 실행)
    print(f"Executing: {step['description']}")
    # 이 예제에서는 subprocess를 사용해 Node.js 스크립트를 실행
    subprocess.run(["node", "src/mcp_playwright.js", step['description']], check=True)
