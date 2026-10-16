import { complete, extractJson, jsonError, type LlmMessage } from "@/lib/llm";
import type { LogAnalysisResult } from "@/lib/types";
import {
  asFindings,
  asInt,
  asNarrowSeverity,
  asRecord,
  asString,
  asStringArray,
  FAIL_MSG,
  systemMessage,
} from "../_shared";

export const runtime = "nodejs";

const SCHEMA =
  '{"counts":{"error":number,"warning":number,"info":number},"severity":"low"|"medium"|"high"|"critical","findings":[{"level":"info"|"low"|"medium"|"high"|"critical","title":string,"detail":string}],"summary":string,"fixes":string[]}';

export async function POST(req: Request) {
  try {
    const body = asRecord(await req.json().catch(() => null));
    const text = asString(body.text).trim();

    if (!text) {
      return jsonError("Provide some log text to analyze.", 400);
    }

    const userPayload = [
      "Task: Analyze these application/system logs.",
      "Count the ERROR, WARNING and INFO lines, judge the overall health severity, list 2-6 root-cause findings (each with level info|low|medium|high|critical, a short title and a detail sentence), write a 2-4 sentence summary and 3-6 concrete suggested fixes.",
      "Counts should reflect what is actually visible in the text.",
      `Logs (may be truncated):\n"""\n${text.slice(0, 6000)}\n"""`,
    ].join("\n\n");

    const messages: LlmMessage[] = [
      {
        role: "assistant",
        content: systemMessage(SCHEMA, "Be practical and precise, like a senior SRE doing triage."),
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
    const counts = asRecord(obj.counts);

    const result: LogAnalysisResult = {
      counts: {
        error: asInt(counts.error, 0, 0, 100000),
        warning: asInt(counts.warning, 0, 0, 100000),
        info: asInt(counts.info, 0, 0, 100000),
      },
      severity: asNarrowSeverity(["low", "medium", "high", "critical"] as const, obj.severity, "medium"),
      findings: asFindings(obj.findings),
      summary: asString(obj.summary, "Analysis complete."),
      fixes: asStringArray(obj.fixes).slice(0, 6),
    };

    return Response.json(result);
  } catch (err) {
    console.error("[api/tools/log]", err);
    return jsonError(FAIL_MSG, 502);
  }
}
