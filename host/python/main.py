import argparse
import json
import os
from dotenv import load_dotenv
import asyncio
from core.runner import run_test
from utils.logger import setup_logger

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--build", type=int, required=True, help="Build number")
    parser.add_argument(
        "--output_dir", type=str, default="./results", help="Output directory"
    )
    parser.add_argument(
        "--file", type=str, required=True, help="Scenario JSON file path"
    )
    parser.add_argument(
        "--language",
        type=str,
        default="en",
        help="Language for LLM responses (e.g., 'en', 'ko', 'ja', 'zh', etc.)",
    )
    args = parser.parse_args()

    # Setup logger
    logger = setup_logger()
    logger.info("Starting test execution")

    try:
        load_dotenv()
        prov = os.getenv("LLM_PROVIDER")
        model_key = os.getenv("LLM_MODEL")
        api_k = os.getenv("LLM_API_KEY")

        if not all([prov, model_key, api_k]):
            raise ValueError("Required environment variables are not set")

        logger.info(f"LLM Provider: {prov}")
        logger.info(f"Model: {model_key}")
        logger.info(f"Response Language: {args.language}")

        with open(args.file, "r", encoding="utf-8") as f:
            data = json.load(f)
        scenarios = data.get("scenarios", [])

        logger.info(f"Total scenarios to execute: {len(scenarios)}")

        asyncio.run(
            run_test(
                scenarios,
                args.build,
                args.output_dir,
                prov,
                model_key,
                api_k,
                args.language,
            )
        )

        logger.info("All tests completed successfully")
    except Exception as e:
        logger.error(f"Error occurred during test execution: {str(e)}", exc_info=True)
        raise
