import asyncio
import json
import base64
import os
import shutil
from typing import List, Tuple
from langchain_core.messages import ToolMessage, AIMessage
from utils.io_utils import extract_json_from_message
from model.schema import WebTestResult
from utils.prompt import prompt, output_parser, get_language_name


def create_instruction(steps: List[str]) -> str:
    return "\n".join(f"{i+1}. {step}" for i, step in enumerate(steps))


def run_logic(
    agent, steps: List[str], screenshot_dir: str, language: str = "en"
) -> asyncio.Task:
    return asyncio.create_task(_run_logic(agent, steps, screenshot_dir, language))


async def _run_logic(
    agent, steps: List[str], screenshot_dir: str, language: str = "en"
) -> Tuple[WebTestResult, List[str]]:
    language_name = get_language_name(language)
    response = await agent.ainvoke(
        {
            "messages": [
                {"role": "system", "content": prompt.format(language=language_name)},
                {"role": "user", "content": create_instruction(steps)},
            ]
        },
        config={"recursion_limit": 100},
    )

    saved = []
    count = 1
    for ev in response["messages"]:
        if isinstance(ev, ToolMessage):
            # artifact-based
            if getattr(ev, "artifact", None):
                for art in ev.artifact:
                    if getattr(art, "type", "") == "image" and hasattr(art, "data"):
                        fname = f"{count}.png"
                        out = os.path.join(screenshot_dir, fname)
                        with open(out, "wb") as imgf:
                            imgf.write(base64.b64decode(art.data))
                        saved.append(fname)
                        count += 1
            # legacy [screenshot_path]
            if isinstance(ev.content, str):
                try:
                    items = json.loads(ev.content)
                    for it in items:
                        if isinstance(it, str) and it.startswith("[screenshot_path] "):
                            src = it.split("[screenshot_path] ", 1)[1].strip()
                            if os.path.isfile(src):
                                fname = f"{count}.png"
                                dst = os.path.join(screenshot_dir, fname)
                                shutil.copy(src, dst)
                                saved.append(fname)
                                count += 1
                except json.JSONDecodeError:
                    pass

    last = response["messages"][-1]
    json_text = extract_json_from_message(last)
    result = output_parser.parse(json_text)
    return result, saved
