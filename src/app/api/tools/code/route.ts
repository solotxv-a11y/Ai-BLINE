import { complete, extractJson, jsonError, type LlmMessage } from "@/lib/llm";
import type { CodeIssue, CodeReviewResult } from "@/lib/types";
import {
  asNarrowSeverity,
  asRecord,
  asString,
  FAIL_MSG,
  systemMessage,
} from "../_shared";

export const runtime = "nodejs";

const SCHEMA =
  '{"issues":[{"title":string,"detail":string,"severity":"low"|"medium"|"high"}],"improvedCode":string,"explanation":string}';

const LANGUAGES: readonly string[] = [
  "TypeScript",
  "JavaScript",
  "Python",
  "Java",
  "C#",
  "C++",
  "PHP",
  "Go",
  "Rust",
  "SQL",
  "Bash",
];

function asIssue(value: unknown): CodeIssue | null {
  const o = asRecord(value);
  const title = asString(o.title).trim();
  if (!title) return null;
  return {
    title,
    detail: asString(o.detail, ""),
    severity: asNarrowSeverity(["low", "medium", "high"] as const, o.severity, "medium"),
  };
}

export async function POST(req: Request) {
  try {
    const body = asRecord(await req.json().catch(() => null));
    const code = asString(body.code);
    const language = asString(body.language).trim();

    if (!code.trim()) {
      return jsonError("Provide some code to review.", 400);
    }
    if (!LANGUAGES.includes(language)) {
      return jsonError("Unsupported language.", 400);
    }

    const userPayload = [
      `Task: Review this ${language} code like a senior engineer.`,
      "Find real bugs, security issues and bad practices (0-8 issues, ordered by importance). Each issue: a short title, a detail sentence, and severity low|medium|high.",
      "improvedCode: the FULL corrected version of the submitted code in the same language — raw source only, no markdown fences inside the string.",
      "explanation: 2-5 sentences on what you changed and why.",
      `Language: ${language}`,
      `Code (may be truncated):\n"""\n${code.slice(0, 6000)}\n"""`,
    ].join("\n\n");

    const messages: LlmMessage[] = [
      {
        role: "assistant",
        content: systemMessage(SCHEMA, "Focus on correctness, security and readability. Be constructive."),
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
    const issues = (Array.isArray(obj.issues) ? obj.issues : [])
      .map(asIssue)
      .filter((i): i is CodeIssue => i !== null)
      .slice(0, 8);

    const result: CodeReviewResult = {
      issues,
      improvedCode: asString(obj.improvedCode, code),
      explanation: asString(obj.explanation, ""),
    };

    return Response.json(result);
  } catch (err) {
    console.error("[api/tools/code]", err);
    return jsonError(FAIL_MSG, 502);
  }
}
