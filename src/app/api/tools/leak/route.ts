import { complete, extractJson, jsonError, type LlmMessage } from "@/lib/llm";
import type { LeakBreach, LeakResult } from "@/lib/types";
import { asNarrowSeverity, asRecord, asString, asStringArray, FAIL_MSG, systemMessage } from "../_shared";

export const runtime = "nodejs";

const SCHEMA =
  '{"found":boolean,"breaches":[{"name":string,"date":string,"dataTypes":string[],"severity":"low"|"medium"|"high"}],"tips":string[]}';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function asBreach(value: unknown): LeakBreach | null {
  const o = asRecord(value);
  const name = asString(o.name).trim();
  if (!name) return null;
  return {
    name,
    date: asString(o.date, "Unknown date"),
    dataTypes: asStringArray(o.dataTypes),
    severity: asNarrowSeverity(["low", "medium", "high"] as const, o.severity, "medium"),
  };
}

export async function POST(req: Request) {
  try {
    const body = asRecord(await req.json().catch(() => null));
    const email = asString(body.email).trim().toLowerCase();

    if (!EMAIL_RE.test(email)) {
      return jsonError("Enter a valid email address.", 400);
    }

    const userPayload = [
      `Task: Simulate an educational breach-database check for the email "${email}".`,
      'Generate 0 to 3 plausible SIMULATED breaches using famous-sounding generic service names (e.g. "CloudPortal 2019", "ShopNet", "MailWave") — never real companies. Each breach needs: a past date (e.g. "2019-03-14" or "Mar 2019"), 2-5 dataTypes (e.g. "Email addresses", "Passwords (hashed)", "Phone numbers") and a severity "low", "medium" or "high".',
      "Also provide exactly 4 practical, friendly tips for responding to a breach.",
      'If the local part clearly suggests a clean/test address (contains "safe", "clean" or "test"), return found=false with an empty breaches array. Otherwise include 1-3 breaches.',
    ].join("\n\n");

    const messages: LlmMessage[] = [
      {
        role: "assistant",
        content: systemMessage(
          SCHEMA,
          "This is a clearly-labelled simulation for education. Never claim to query real breach databases.",
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
    const breaches = (Array.isArray(obj.breaches) ? obj.breaches : [])
      .map(asBreach)
      .filter((b): b is LeakBreach => b !== null)
      .slice(0, 3);

    const result: LeakResult = {
      simulated: true,
      email,
      found: breaches.length > 0,
      breaches,
      tips: asStringArray(obj.tips).slice(0, 4),
    };

    return Response.json(result);
  } catch (err) {
    console.error("[api/tools/leak]", err);
    return jsonError(FAIL_MSG, 502);
  }
}
