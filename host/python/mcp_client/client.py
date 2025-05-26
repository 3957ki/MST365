import os
from mcp.client.stdio import stdio_client
from mcp import ClientSession, StdioServerParameters


def get_stdio_params():
    cur = os.path.dirname(os.path.abspath(__file__))
    mcp_path = os.path.join(cur, "..", "mcp")
    return StdioServerParameters(command="node", args=["cli.js"], cwd=mcp_path)


async def create_mcp_session():
    params = get_stdio_params()
    client = stdio_client(params)
    return client
