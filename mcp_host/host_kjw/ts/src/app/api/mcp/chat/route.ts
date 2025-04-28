/* eslint-disable @typescript-eslint/no-explicit-any */
import { TMcpServer } from "@/types/mcp.type";
import { NextResponse } from "next/server";

import { mcpServer } from "@/utils/mcpServer";
import { model } from "@/utils/model";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { z } from "zod";
import { StructuredOutputParser } from "langchain/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

// 1. 리포트 스키마 정의
export const TestReportSchema = z.object({
  title: z.string(),
  overall_status: z.enum(["성공", "실패"]),
  steps: z.array(
    z.object({
      step: z.string(),
      status: z.enum(["성공", "실패"]),
      error: z.string().nullable(),
    })
  ),
  feedback: z.object({
    pros: z.string(),
    cons: z.string(),
  }),
});

const outputParser = StructuredOutputParser.fromZodSchema(TestReportSchema);

const summarizationPrompt = new PromptTemplate({
  inputVariables: ["raw_result", "title"],
  partialVariables: {
    format_instructions: outputParser.getFormatInstructions(),
  },
  template: `
너는 웹 테스트 요약을 작성하는 어시스턴트입니다.

다음은 테스트 결과입니다:
{raw_result}

이 결과를 다음 JSON 포맷으로 요약해줘:
{format_instructions}

시나리오 제목은 "{title}" 이다.
`.trim(),
});

type ServerConfig = {
  [key: string]: {
    transport: string;
    url?: string;
    command?: string;
    args?: string[];
  };
};

function getMcpServerTransport(server: TMcpServer): ServerConfig {
  return {
    [server.name]: {
      transport: "sse",
      url: server.url as string,
    },
  };
}

export async function POST(request: Request) {
  try {
    const { title, steps } = await request.json();

    const server = mcpServer;
    const serverConfig = getMcpServerTransport(server);

    const client = new MultiServerMCPClient({
      mcpServers: serverConfig as any,
    });

    const tools = await client.getTools();

    const agent = createReactAgent({
      tools,
      llm: model,
    });

    // 2. MCP 테스트 수행 (raw 결과 얻기)
    const testResult = await agent.invoke({
      messages: [
        {
          role: "user",
          content: `
            테스트 시나리오:

            시나리오 제목: ${title}

            ${steps.join("\n")}
            `.trim(),
        },
      ],
    });

    console.log(testResult);

    await client.close();

    // 3. LLM에게 다시 정리 요청 (요약 체인)
    const summarizationChain = summarizationPrompt.pipe(model).pipe(outputParser);

    const parsedResult = await summarizationChain.invoke({
      raw_result: JSON.stringify(testResult),
      title: title,
    });

    // 4. 최종 응답
    return NextResponse.json({
      result: parsedResult,
      status: "success",
    });
  } catch (error: any) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
