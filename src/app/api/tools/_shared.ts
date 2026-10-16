import type { Finding, Severity } from "@/lib/types";

/** Standard message returned when the LLM call or JSON parse fails. */
export const FAIL_MSG = "AI analysis failed. Please try again.";

/**
 * Build the system message. The SDK expects the system prompt as the first
 * message with role "assistant".
 */
export function systemMessage(schema: string, extra = ""): string {
  return [
    "You are Ai BLINE's security analysis engine inside a defensive, educational cybersecurity app.",
    "Follow the task instructions precisely. Stay within legal, ethical and defensive guidance — never provide instructions for attacking real systems.",
    extra,
    `Respond with ONLY a valid JSON object matching exactly this schema: ${schema}. No markdown fences, no commentary.`,
  ]
    .filter((part) => part && part.length > 0)
    .join("\n");
}

export function clampInt(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Map a 0-100 safety score to a link verdict. */
export function verdictForScore(score: number): "safe" | "suspicious" | "dangerous" {
  if (score < 50) return "dangerous";
  if (score < 78) return "suspicious";
  return "safe";
}

export function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

export function asInt(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return clampInt(Math.round(n), min, max);
}

const SEVERITIES: readonly Severity[] = ["info", "low", "medium", "high", "critical"];

export function asSeverity(value: unknown, fallback: Severity = "info"): Severity {
  return SEVERITIES.includes(value as Severity) ? (value as Severity) : fallback;
}

export function asNarrowSeverity<T extends string>(allowed: readonly T[], value: unknown, fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export function asFindings(value: unknown): Finding[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item): Finding => {
      const o = (item ?? {}) as Record<string, unknown>;
      return {
        level: asSeverity(o.level),
        title: asString(o.title, "Finding"),
        detail: asString(o.detail, ""),
      };
    })
    .filter((f) => f.title.length > 0);
}

export function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => asString(item)).filter((s) => s.trim().length > 0);
}

/** Coerce an unknown value into a record (or an empty one). */
export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}
