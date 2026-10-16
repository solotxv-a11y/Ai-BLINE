import { complete, extractJson, jsonError, type LlmMessage } from "@/lib/llm";
import type { VulnResult } from "@/lib/types";
import {
  asNarrowSeverity,
  asRecord,
  asString,
  asStringArray,
  FAIL_MSG,
  systemMessage,
} from "../_shared";

export const runtime = "nodejs";

const SCHEMA =
  '{"title":string,"severity":"low"|"medium"|"high"|"critical","description":string,"howItWorks":string,"example":string,"prevention":string[]}';

export async function POST(req: Request) {
  try {
    const body = asRecord(await req.json().catch(() => null));
    const topic = asString(body.topic).trim();

    if (!topic) {
      return jsonError("Provide a vulnerability topic.", 400);
    }
    if (topic.length > 200) {
      return jsonError("Topic is too long.", 400);
    }

    const userPayload = [
      `Task: Write a defensive, educational explanation of the vulnerability topic "${topic}".`,
      "description: what it is and why it matters (2-4 sentences, friendly).",
      "howItWorks: the general mechanism in plain language (3-6 sentences) — conceptual, not an exploit recipe.",
      "example: a SHORT generic, illustrative code or pseudo-code snippet (max ~15 lines) showing the vulnerable pattern and/or the safe pattern. Educational only — no working exploit payload against real targets, no real endpoints.",
      "prevention: exactly 4-6 concrete prevention items.",
    ].join("\n\n");

    const messages: LlmMessage[] = [
      {
        role: "assistant",
        content: systemMessage(
          SCHEMA,
          "Defensive framing only: teach recognition and prevention, never provide ready-to-run attacks.",
        ),
      },
      { role: "user", content: userPayload },
    ];

    const raw = await complete(messages);

    let parsed: unknown;
    try {
      parsed = extractJson<unknown>(raw);
    } catch {
      return jsonError(FAIL_MSG, 502);
    }

    const obj = asRecord(parsed);

    const result: VulnResult = {
      title: asString(obj.title, topic),
      severity: asNarrowSeverity(["low", "medium", "high", "critical"] as const, obj.severity, "medium"),
      description: asString(obj.description, ""),
      howItWorks: asString(obj.howItWorks, ""),
      example: asString(obj.example, ""),
      prevention: asStringArray(obj.prevention).slice(0, 6),
    };

    return Response.json(result);
  } catch (err) {
    console.error("[api/tools/vuln]", err);
    return jsonError(FAIL_MSG, 502);
  }
}
