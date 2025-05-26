import os
import logging
from datetime import datetime
from typing import List, Tuple
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langgraph.prebuilt import create_react_agent
from langchain_mcp_adapters.tools import load_mcp_tools
from core.scenario import _run_scenario
from model.schema import WebTestResult
from mcp import ClientSession
from mcp_client.client import create_mcp_session
from report.html_report import generate_combined_html_report

logger = logging.getLogger("web_test")


async def run_test(
    scenarios: List[dict],
    build_num: int,
    base_dir: str,
    provider: str,
    llm_model: str,
    api_key: str,
    language: str = "en",
):
    test_start = datetime.now()
    timestamp = test_start.strftime("%Y%m%d-%H%M%S")
    test_id = f"{timestamp}_report_{build_num}"
    output_dir = os.path.join(base_dir, test_id)
    os.makedirs(output_dir, exist_ok=True)

    logger.info(f"Test ID: {test_id}")
    logger.info(f"Output directory: {output_dir}")

    # Model selection
    try:
        if provider == "anthropic":
            model = ChatAnthropic(model=llm_model, temperature=0, api_key=api_key)
        elif provider == "openai":
            model = ChatOpenAI(model=llm_model, temperature=0, api_key=api_key)
        else:
            raise ValueError(f"Unsupported provider: {provider}")
        logger.info(f"LLM model initialized: {provider}/{llm_model}")
    except Exception as e:
        logger.error(f"Failed to initialize LLM model: {str(e)}")
        raise

    results: List[Tuple[int, WebTestResult, List[str]]] = []
    try:
        async with await create_mcp_session() as (read, write):
            async with ClientSession(read, write) as session:
                logger.info("Initializing MCP session...")
                await session.initialize()
                tools = await load_mcp_tools(session)
                logger.info("MCP tools loaded successfully")

                for idx, scenario in enumerate(scenarios, start=1):
                    logger.info(
                        f"Executing scenario {idx}/{len(scenarios)}: {scenario.get('title', '')}"
                    )
                    agent = create_react_agent(model, tools)
                    result = await _run_scenario(
                        agent, scenario, idx, output_dir, language
                    )
                    results.append(result)
                    logger.info(f"Scenario {idx} completed")

    except Exception as e:
        logger.error(f"Error during MCP session execution: {str(e)}")
        raise

    # Generate HTML report
    duration_ms = (datetime.now() - test_start).total_seconds() * 1000
    logger.info(f"Generating HTML report... (Duration: {duration_ms:.2f}ms)")
    generate_combined_html_report(results, output_dir, test_start, duration_ms, test_id)
    logger.info(f"Test completed: {output_dir}/report.html")
