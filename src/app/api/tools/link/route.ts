import { complete, extractJson, jsonError, type LlmMessage } from "@/lib/llm";
import type { LinkAnalysisResult } from "@/lib/types";
import {
  asFindings,
  asInt,
  asRecord,
  asString,
  clampInt,
  FAIL_MSG,
  systemMessage,
  verdictForScore,
} from "../_shared";

export const runtime = "nodejs";

const SUSPICIOUS_TLDS: readonly string[] = ["zip", "mov", "top", "xyz", "tk", "ml", "ga", "cf", "gq", "work", "click"];
const PATH_KEYWORDS: readonly string[] = ["login", "verify", "secure", "account", "update", "confirm", "signin", "bank"];

const SCHEMA =
  '{"verdict":"safe"|"suspicious"|"dangerous","score":number,"findings":[{"level":"info"|"low"|"medium"|"high"|"critical","title":string,"detail":string}],"summary":string}';

interface UrlFlag {
  label: string;
  penalty: number;
}

/** Deterministic URL heuristics — returns flags and a preliminary safety score. */
function heuristicScan(raw: string): { flags: UrlFlag[]; score: number } {
  const input = raw.trim();
  const flags: UrlFlag[] = [];

  let parsed: URL | null = null;
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(input);
  try {
    parsed = new URL(hasScheme ? input : `https://${input}`);
  } catch {
    parsed = null;
  }

  if (!parsed) {
    flags.push({ label: "Input is not a recognizable URL", penalty: 25 });
    return { flags, score: 60 };
  }

  const { protocol, username, hostname, href } = parsed;

  if (protocol === "data:" || protocol === "javascript:") {
    flags.push({ label: `Uses the dangerous "${protocol}" scheme`, penalty: 25 });
  } else if (protocol === "http:") {
    flags.push({ label: "Unencrypted connection (http instead of https)", penalty: 15 });
  }

  const host = hostname.toLowerCase();

  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host) || host.includes(":")) {
    flags.push({ label: "Host is a raw IP address instead of a domain name", penalty: 20 });
  }

  if (host.startsWith("xn--") || host.includes(".xn--")) {
    flags.push({ label: "Punycode domain — possible look-alike character spoofing", penalty: 22 });
  }

  if (username !== "" || /\/\/[^/@]*@/.test(input)) {
    flags.push({ label: "Credentials embedded in the URL (the '@' trick)", penalty: 20 });
  }

  if (input.length > 100) {
    flags.push({ label: "Unusually long URL — often used to hide the real destination", penalty: 12 });
  }

  const hostParts = host.split(".").filter(Boolean);
  if (hostParts.length > 4) {
    flags.push({ label: "Deeply nested subdomain chain", penalty: 12 });
  }

  if ((host.match(/-/g) ?? []).length >= 3) {
    flags.push({ label: "Many hyphens in the hostname", penalty: 12 });
  }

  const tld = hostParts.length > 1 ? (hostParts[hostParts.length - 1] as string) : "";
  if (SUSPICIOUS_TLDS.includes(tld)) {
    flags.push({ label: `Suspicious top-level domain ".${tld}"`, penalty: 20 });
  }

  const lowerHref = href.toLowerCase();
  const keywordHits = PATH_KEYWORDS.filter((k) => lowerHref.includes(k));
  if (keywordHits.length > 0) {
    flags.push({
      label: `Credential-related keywords in the URL (${keywordHits.slice(0, 3).join(", ")})`,
      penalty: keywordHits.length >= 2 ? 18 : 15,
    });
  }

  const penalty = flags.reduce((sum, f) => sum + f.penalty, 0);
  return { flags, score: clampInt(100 - penalty, 0, 100) };
}

export async function POST(req: Request) {
  try {
    const body = asRecord(await req.json().catch(() => null));
    const url = asString(body.url).trim();
    const fileText = asString(body.fileText);
    const fileName = asString(body.fileName).trim();

    if (!url && !fileText.trim()) {
      return jsonError("Provide a URL or file text to analyze.", 400);
    }
    if (url.length > 2048) {
      return jsonError("URL is too long.", 400);
    }

    let userPayload: string;
    let forcedScore: number | null = null;

    if (url) {
      const { flags, score } = heuristicScan(url);
      forcedScore = score;
      const verdict = verdictForScore(score);
      const flagLines =
        flags.length > 0
          ? flags.map((f) => `- ${f.label} (risk -${f.penalty})`).join("\n")
          : "- No structural red flags detected by the deterministic pre-scan";
      userPayload = [
        "Task: Analyze this URL for phishing or malicious intent and write the final report.",
        `URL: ${url}`,
        `Deterministic pre-scan findings:\n${flagLines}`,
        `Preliminary safety score: ${score}/100.`,
        `The final verdict MUST be "${verdict}" and the score MUST be ${score}.`,
        "Write 2-6 findings that explain each flag in friendly, non-alarming language (or confirm the URL looks clean with info-level findings). Give a 2-4 sentence summary with practical advice.",
      ].join("\n\n");
    } else {
      userPayload = [
        "Task: Analyze this file/text content for malicious indicators: script injection, powershell -enc, base64 blobs, inverted/obfuscated strings, droppers, shellcode or suspicious network calls.",
        `File name: ${fileName || "pasted text"}`,
        `Content:\n"""\n${fileText.slice(0, 6000)}\n"""`,
        "Choose a score 0-100 (safety) and a verdict safe/suspicious/dangerous consistent with it (score < 50 dangerous, < 78 suspicious). Write 2-6 findings and a 2-4 sentence summary with practical advice.",
      ].join("\n\n");
    }

    const messages: LlmMessage[] = [
      {
        role: "assistant",
        content: systemMessage(SCHEMA, "Be factual and defensive. Never provide attack instructions."),
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
    const score = asInt(obj.score, forcedScore ?? 70, 0, 100);
    const rawVerdict = asString(obj.verdict);
    const verdict: LinkAnalysisResult["verdict"] =
      rawVerdict === "safe" || rawVerdict === "suspicious" || rawVerdict === "dangerous"
        ? rawVerdict
        : verdictForScore(score);

    const result: LinkAnalysisResult = {
      verdict,
      score,
      findings: asFindings(obj.findings),
      summary: asString(obj.summary, "Analysis complete."),
    };

    return Response.json(result);
  } catch (err) {
    console.error("[api/tools/link]", err);
    return jsonError(FAIL_MSG, 502);
  }
}
