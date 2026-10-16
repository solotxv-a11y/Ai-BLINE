import ZAI from "z-ai-web-dev-sdk";

type ZAIClient = Awaited<ReturnType<typeof ZAI.create>>;

let _zai: ZAIClient | null = null;

/** Get a shared ZAI SDK instance (backend only). */
export async function getZAI(): Promise<ZAIClient> {
  if (!_zai) {
    _zai = await ZAI.create();
  }
  return _zai;
}

export interface LlmMessage {
  /** The SDK expects the system prompt as the first message with role "assistant" */
  role: "user" | "assistant";
  content: string;
}

/** Run a chat completion and return the raw text content. */
export async function complete(messages: LlmMessage[]): Promise<string> {
  const zai = await getZAI();
  const completion = await zai.chat.completions.create({
    messages,
    thinking: { type: "disabled" },
  });
  const content = completion.choices[0]?.message?.content;
  if (!content || !content.trim()) {
    throw new Error("Empty AI response");
  }
  return content.trim();
}

/**
 * Extract the first JSON object/array found in an LLM response.
 * Handles ```json fenced blocks and surrounding prose.
 */
export function extractJson<T>(raw: string): T {
  let text = raw.trim();

  // Remove markdown fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  // Try direct parse
  try {
    return JSON.parse(text) as T;
  } catch {
    /* continue */
  }

  // Find first {...} or [...] block
  const objStart = text.indexOf("{");
  const arrStart = text.indexOf("[");
  let start = -1;
  let end = -1;

  if (objStart === -1 && arrStart === -1) {
    throw new Error("No JSON found in AI response");
  }

  if (objStart !== -1 && (arrStart === -1 || objStart < arrStart)) {
    start = objStart;
    end = text.lastIndexOf("}");
  } else {
    start = arrStart;
    end = text.lastIndexOf("]");
  }

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No valid JSON found in AI response");
  }

  const candidate = text.slice(start, end + 1);
  try {
    return JSON.parse(candidate) as T;
  } catch {
    // Last resort: try trimming to the matching bracket
    const trimmed = candidate.substring(0, candidate.lastIndexOf("}") + 1 || undefined);
    return JSON.parse(trimmed) as T;
  }
}

export function jsonError(message: string, status = 500) {
  return Response.json({ error: message }, { status });
}

export function isRateLikeError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message.toLowerCase() : "";
  return msg.includes("rate") || msg.includes("429") || msg.includes("quota");
}
