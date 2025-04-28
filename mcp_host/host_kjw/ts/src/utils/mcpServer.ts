import { EMcpServerType, EMcpServerStatus, TMcpServer } from "@/types/mcp.type";

// 고정된 하나의 MCP 서버만 사용
export const mcpServer: TMcpServer = {
  id: "playwright",
  name: "playwright",
  desc: "Playwright MCP Server",
  status: EMcpServerStatus.RUNNING,
  type: EMcpServerType.REMOTE,
  url: "http://localhost:8005/sse",
  args: [],
  tools: [],
  histories: [],
};
