import { complete, extractJson, jsonError, type LlmMessage } from "@/lib/llm";
import type { TranslateResult } from "@/lib/types";
import { asRecord, asString, asStringArray, FAIL_MSG, systemMessage } from "../_shared";

export const runtime = "nodejs";

const SCHEMA = '{"translation":string,"notes":string[]}';

const DOMAINS: readonly string[] = ["General", "Security", "Programming"];

export async function POST(req: Request) {
  try {
    const body = asRecord(await req.json().catch(() => null));
    const text = asString(body.text).trim();
    const domain = asString(body.domain).trim();
    const targetLang = asString(body.targetLang).trim();

    if (!text) {
      return jsonError("Provide text to translate.", 400);
    }
    if (!DOMAINS.includes(domain)) {
      return jsonError("Domain must be General, Security or Programming.", 400);
    }
    if (!targetLang) {
      return jsonError("Provide a target language.", 400);
    }

    const userPayload = [
      `Task: Professionally translate the following text into ${targetLang}.`,
      `Domain: ${domain} — adapt tone and terminology to that domain.`,
      "Preserve technical terms, product names, code identifiers and well-known abbreviations (e.g. XSS, API, 2FA, HTTP) in their original form, unless a standard official translation exists in the target language.",
      "notes: 2-4 short bullets (in English) about preserved terms, terms without a direct translation, or choices a reviewer should know about.",
      `Text (may be truncated):\n"""\n${text.slice(0, 5000)}\n"""`,
    ].join("\n\n");

    const messages: LlmMessage[] = [
      {
        role: "assistant",
        content: systemMessage(
          SCHEMA,
          "You are a professional translator specialized in technical and security content. Translate faithfully — never censor, summarize or answer the text.",
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

    const result: TranslateResult = {
      translation: asString(obj.translation, ""),
      notes: asStringArray(obj.notes).slice(0, 4),
    };

    if (!result.translation) {
      return jsonError(FAIL_MSG, 502);
    }

    return Response.json(result);
  } catch (err) {
    console.error("[api/tools/translate]", err);
    return jsonError(FAIL_MSG, 502);
  }
}
