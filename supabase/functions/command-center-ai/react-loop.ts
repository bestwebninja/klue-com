/**
 * ReAct (Reason + Act) execution engine.
 *
 * Implements the Think → Act → Observe → Think loop using OpenAI's tool-calling API.
 * Each iteration:
 *   1. Sends messages (including prior observations) to the model.
 *   2. If the model calls tools, executes them and appends observations.
 *   3. Repeats until the model produces a plain text/JSON final answer or MAX_ITERATIONS is reached.
 *
 * All reasoning steps are captured for full auditability.
 */

import { ToolDefinition, ToolResult } from "./tools.ts";

export const REACT_MODEL = "gpt-4.1-mini";
export const MAX_ITERATIONS = 8;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReActToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
  result: ToolResult;
}

export interface ReActStep {
  iteration: number;
  thought: string;
  toolCalls: ReActToolCall[];
  observation: string;
}

export interface ReActResult {
  output: unknown;
  steps: ReActStep[];
  iterationCount: number;
  model: string;
  finishReason: "answer" | "max_iterations" | "error";
  error?: string;
}

// OpenAI message types (minimal surface needed)
interface SystemMessage { role: "system"; content: string; }
interface UserMessage { role: "user"; content: string; }
interface AssistantMessage {
  role: "assistant";
  content: string | null;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }>;
}
interface ToolMessage { role: "tool"; tool_call_id: string; content: string; }

type ChatMessage = SystemMessage | UserMessage | AssistantMessage | ToolMessage;

interface OpenAIChoice {
  message: AssistantMessage;
  finish_reason: string;
}

interface OpenAIChatResponse {
  choices: OpenAIChoice[];
  model: string;
  error?: { message: string };
}

// ---------------------------------------------------------------------------
// Core loop
// ---------------------------------------------------------------------------

export async function runReActLoop(
  openAiKey: string,
  systemPrompt: string,
  userMessage: string,
  tools: ToolDefinition[],
  executeTool: (name: string, args: Record<string, unknown>) => Promise<ToolResult>
): Promise<ReActResult> {
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];

  const steps: ReActStep[] = [];
  let iterationCount = 0;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    iterationCount = i + 1;

    // Call OpenAI
    const response = await callOpenAI(openAiKey, messages, tools);

    if (response.error) {
      return {
        output: null,
        steps,
        iterationCount,
        model: REACT_MODEL,
        finishReason: "error",
        error: response.error.message,
      };
    }

    const choice = response.choices?.[0];
    if (!choice) {
      return {
        output: null,
        steps,
        iterationCount,
        model: REACT_MODEL,
        finishReason: "error",
        error: "Empty response from model.",
      };
    }

    const assistantMsg = choice.message;

    // If no tool calls → model has produced a final answer
    if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
      const rawContent = assistantMsg.content ?? "";
      let parsed: unknown = rawContent;

      // Attempt to parse JSON output
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          // Return raw string if JSON parse fails
        }
      }

      // Record a final thought step with no tool calls
      steps.push({
        iteration: iterationCount,
        thought: rawContent.slice(0, 500),
        toolCalls: [],
        observation: "Final answer produced.",
      });

      return {
        output: parsed,
        steps,
        iterationCount,
        model: REACT_MODEL,
        finishReason: "answer",
      };
    }

    // Execute tool calls
    const toolCalls: ReActToolCall[] = [];
    const toolMessages: ToolMessage[] = [];

    for (const tc of assistantMsg.tool_calls) {
      let callArgs: Record<string, unknown> = {};
      try {
        callArgs = JSON.parse(tc.function.arguments);
      } catch {
        callArgs = {};
      }

      let result: ToolResult;
      try {
        result = await executeTool(tc.function.name, callArgs);
      } catch (err) {
        result = { error: (err as Error).message ?? "Tool execution failed." };
      }

      toolCalls.push({ id: tc.id, name: tc.function.name, args: callArgs, result });
      toolMessages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: JSON.stringify(result),
      });
    }

    // Build observation summary for the step log
    const observation = toolCalls
      .map((tc) => `${tc.name}(${JSON.stringify(tc.args)}) → ${JSON.stringify(tc.result).slice(0, 300)}`)
      .join(" | ");

    steps.push({
      iteration: iterationCount,
      thought: assistantMsg.content ?? "(no thought text)",
      toolCalls,
      observation,
    });

    // Append assistant message + all tool results to context
    messages.push(assistantMsg as AssistantMessage);
    messages.push(...toolMessages);
  }

  // Exceeded max iterations — return whatever the last assistant message said
  const lastAssistant = messages.filter((m) => m.role === "assistant").pop() as AssistantMessage | undefined;
  const lastContent = lastAssistant?.content ?? null;
  let lastOutput: unknown = lastContent;
  if (typeof lastContent === "string") {
    const jsonMatch = lastContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try { lastOutput = JSON.parse(jsonMatch[0]); } catch { /* keep string */ }
    }
  }

  return {
    output: lastOutput,
    steps,
    iterationCount,
    model: REACT_MODEL,
    finishReason: "max_iterations",
    error: `Reached maximum of ${MAX_ITERATIONS} iterations without a clean final answer.`,
  };
}

// ---------------------------------------------------------------------------
// OpenAI API call
// ---------------------------------------------------------------------------

async function callOpenAI(
  apiKey: string,
  messages: ChatMessage[],
  tools: ToolDefinition[]
): Promise<OpenAIChatResponse> {
  const body: Record<string, unknown> = {
    model: REACT_MODEL,
    messages,
    temperature: 0.1,  // Low temperature for consistent, reliable reasoning
    max_tokens: 2048,
  };

  if (tools.length > 0) {
    body.tools = tools;
    body.tool_choice = "auto";
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    return { choices: [], model: REACT_MODEL, error: { message: `OpenAI API error ${res.status}: ${errText.slice(0, 200)}` } };
  }

  return res.json() as Promise<OpenAIChatResponse>;
}
