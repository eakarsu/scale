import OpenAI from "openai";

export function getOpenRouterClient() {
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY || "",
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "Nexus AI Platform",
    },
  });
}

export const SUPPORTED_MODELS = [
  { id: "anthropic/claude-sonnet-4-5-20250929", name: "claude-sonnet-4-5", provider: "anthropic" },
  { id: "anthropic/claude-opus-4-6", name: "claude-opus-4-6", provider: "anthropic" },
  { id: "anthropic/claude-haiku-4-5", name: "claude-haiku-4-5", provider: "anthropic" },
  { id: "openai/gpt-4o-2025-08-06", name: "gpt-4o", provider: "openai" },
  { id: "openai/gpt-4o-mini", name: "gpt-4o-mini", provider: "openai" },
  { id: "google/gemini-2.5-pro-preview-05-06", name: "gemini-2.5-pro", provider: "google" },
  { id: "google/gemini-2.5-flash-preview-05-20", name: "gemini-2.5-flash", provider: "google" },
  { id: "meta-llama/llama-4-maverick", name: "llama-4-maverick", provider: "meta" },
  { id: "deepseek/deepseek-r1", name: "deepseek-r1", provider: "deepseek" },
  { id: "mistralai/mistral-large-2", name: "mistral-large-2", provider: "mistral" },
  { id: "cohere/command-r-plus", name: "command-r-plus", provider: "cohere" },
  { id: "qwen/qwen-2.5-72b-instruct", name: "qwen-2.5-72b", provider: "alibaba" },
  { id: "microsoft/phi-4", name: "phi-4", provider: "microsoft" },
  { id: "x-ai/grok-3", name: "grok-3", provider: "xai" },
  { id: "amazon/nova-pro-v1", name: "nova-pro", provider: "amazon" },
  { id: "mistralai/devstral-small", name: "devstral-small", provider: "mistral" },
] as const;
