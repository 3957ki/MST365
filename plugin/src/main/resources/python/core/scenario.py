import os
import time
import logging
from typing import Tuple, List
from model.schema import WebTestResult
from core.logic import _run_logic
from utils.io_utils import save_result

logger = logging.getLogger("web_test")


def run_scenario(
    agent, scenario: dict, index: int, output_dir: str, language: str = "en"
):
    return _run_scenario(agent, scenario, index, output_dir, language)


async def _run_scenario(
    agent, scenario: dict, index: int, output_dir: str, language: str = "en"
) -> Tuple[int, WebTestResult, List[str]]:
    scenario_start = time.perf_counter()
    scenario_dir = os.path.join(output_dir, f"{index}")
    screenshot_dir = os.path.join(scenario_dir, "screenshots")
    os.makedirs(screenshot_dir, exist_ok=True)

    logger.info(f"Starting scenario: '{scenario.get('title', '')}'")

    try:
        result, screenshots = await _run_logic(
            agent, scenario.get("steps", []), screenshot_dir, language
        )

        result.duration = time.perf_counter() - scenario_start
        result.title = scenario.get("title", "")

        save_result(scenario, result, screenshots, scenario_dir)
        logger.info(f"Scenario completed (Duration: {result.duration:.2f} seconds)")
        return index, result, screenshots
    except Exception as e:
        logger.error(f"Error during scenario execution: {str(e)}")
        raise
