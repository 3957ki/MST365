import { ChatAnthropic } from "@langchain/anthropic";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const LLM_MODEL = process.env.LLM_MODEL;

let config: any = {
  apiKey: ANTHROPIC_API_KEY,
  model: LLM_MODEL,
};

export const model = new ChatAnthropic(config);
