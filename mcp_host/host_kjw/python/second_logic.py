import asyncio
from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.prebuilt import create_react_agent
from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

# 환경변수 불러오기
load_dotenv(override=True)

# model = ChatAnthropic(model="claude-3-5-haiku-latest", temperature=0)
model = ChatOpenAI(model="gpt-4o-mini", temperature=0)


# Defines an asynchronous main function.
async def main():
    async with MultiServerMCPClient(
        {
            "playwright": {
                "url": "http://localhost:8005/sse",
                "transport": "sse",
            }
        }  # type: ignore
    ) as client:
        agent = create_react_agent(model, client.get_tools())

        langgraph_response = await agent.ainvoke(
            {"messages": "1. 유튜브에 접속해 2. 검색창이 존재하는지 확인해"}
        )
        print(langgraph_response)


# Run the async main function
if __name__ == "__main__":
    asyncio.run(main())
