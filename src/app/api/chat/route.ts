import { db } from "@/lib/db";
import { getAgent } from "@/lib/agents";
import { complete, type LlmMessage } from "@/lib/llm";
import type { ChatSession } from "@prisma/client";

export const runtime = "nodejs";

/** Appended to custom agent prompts so user-created agents stay inside the app's safety line. */
const CUSTOM_SAFETY_SUFFIX = `

Safety & formatting rules (non-negotiable):
- Only provide legal, ethical and defensive guidance. Refuse any request that would enable illegal activity, malware creation, unauthorized access to systems or harm to others, and briefly offer a safe, legal alternative instead.
- Use clean markdown: **bold** for key terms, numbered lists for steps, bullet lists for options, and fenced code blocks (with language tag) for any code or commands.
- Be concise and practical. Prefer 120-300 words unless the user asks for more depth.`;

const MAX_STORED_CONTENT = 8000;
const MAX_MESSAGE_LENGTH = 8000;
const HISTORY_LIMIT = 16;
const MAX_CUSTOM_PROMPT = 4000;

interface ChatRequestBody {
  sessionId?: unknown;
  agent?: unknown;
  message?: unknown;
  regenerate?: unknown;
  customPrompt?: unknown;
}

function badRequest(error: string) {
  return Response.json({ error }, { status: 400 });
}

function capContent(text: string): string {
  return text.length > MAX_STORED_CONTENT ? text.slice(0, MAX_STORED_CONTENT) : text;
}

export async function POST(req: Request) {
  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return badRequest("Invalid JSON body.");
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return badRequest("Invalid request body.");
  }

  const regenerate = body.regenerate === true;

  if (body.message !== undefined && typeof body.message !== "string") {
    return badRequest("Message must be a string.");
  }
  const rawMessage = typeof body.message === "string" ? body.message.trim() : "";
  const message = rawMessage ? rawMessage.slice(0, MAX_MESSAGE_LENGTH) : "";
  if (!message && !regenerate) {
    return badRequest("A message is required.");
  }

  const agentKey =
    typeof body.agent === "string" && body.agent.trim() ? body.agent.trim() : "general";

  let systemPrompt: string;
  if (agentKey === "custom") {
    const customPrompt =
      typeof body.customPrompt === "string" ? body.customPrompt.trim() : "";
    if (customPrompt.length < 3) {
      return badRequest("A custom prompt (min 3 characters) is required for the custom agent.");
    }
    systemPrompt = customPrompt.slice(0, MAX_CUSTOM_PROMPT) + CUSTOM_SAFETY_SUFFIX;
  } else {
    systemPrompt = getAgent(agentKey).systemPrompt;
  }

  // Load or create the session
  let session: ChatSession | null = null;
  if (typeof body.sessionId === "string" && body.sessionId.trim()) {
    session = await db.chatSession.findUnique({ where: { id: body.sessionId.trim() } });
  }
  if (!session) {
    session = await db.chatSession.create({ data: { agent: agentKey } });
  }

  // Last 16 messages of the session, ordered createdAt asc
  const recentDesc = await db.message.findMany({
    where: { sessionId: session.id },
    orderBy: { createdAt: "desc" },
    take: HISTORY_LIMIT,
  });
  const history = [...recentDesc].reverse();

  // For regenerate: drop trailing assistant message(s) from the LLM context
  const llmHistory = [...history];
  const staleTrailingIds: string[] = [];
  if (regenerate) {
    while (llmHistory.length > 0 && llmHistory[llmHistory.length - 1].role === "assistant") {
      staleTrailingIds.push(llmHistory.pop()!.id);
    }
  }

  const llmMessages: LlmMessage[] = [{ role: "assistant", content: systemPrompt }];
  for (const m of llmHistory) {
    llmMessages.push({ role: m.role === "user" ? "user" : "assistant", content: m.content });
  }
  if (message) {
    llmMessages.push({ role: "user", content: message });
  }

  let reply: string;
  try {
    reply = await complete(llmMessages);
  } catch {
    return Response.json(
      { error: "AI service is unavailable right now. Please try again." },
      { status: 500 },
    );
  }

  // Persist (cap any single stored content at 8000 chars)
  if (message && !regenerate) {
    await db.message.create({
      data: { sessionId: session.id, role: "user", content: capContent(message) },
    });
  }
  // Regenerate replaces the previous reply — remove the stale trailing assistant
  // message(s) so the stored history matches what the client shows (one reply).
  if (staleTrailingIds.length > 0) {
    await db.message.deleteMany({ where: { id: { in: staleTrailingIds } } });
  }
  await db.message.create({
    data: { sessionId: session.id, role: "assistant", content: capContent(reply) },
  });

  let title = session.title;
  if (message && title === "New chat") {
    title = message.trim().slice(0, 48) || title;
    await db.chatSession.update({ where: { id: session.id }, data: { title } });
  }

  return Response.json({ sessionId: session.id, title, reply });
}
