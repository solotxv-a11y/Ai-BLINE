"use client";

import { useState } from "react";
import type { VulnResult } from "@/lib/types";
import { postJSON } from "@/lib/api";
import { Input } from "@/components/ui/input";
import {
  Chip,
  CodeBlock,
  ErrorText,
  FadeIn,
  PrimaryButton,
  ResultActions,
  ScanBar,
  SectionLabel,
  SeverityBadge,
  useRotatingStatus,
} from "@/components/tools/shared";

const TOPICS = [
  "XSS",
  "SQL Injection",
  "CSRF",
  "Path Traversal",
  "SSRF",
  "RCE",
  "IDOR",
  "Command Injection",
  "Insecure Deserialization",
  "Phishing",
] as const;

const STATUSES = [
  "Pulling the theory…",
  "Building safe examples…",
  "Collecting defenses…",
] as const;

export default function VulnGuide() {
  const [selected, setSelected] = useState<string | null>(null);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VulnResult | null>(null);

  const status = useRotatingStatus(STATUSES, loading);

  const effectiveTopic = custom.trim() || selected || "";

  const explain = async () => {
    const topic = effectiveTopic;
    if (!topic) {
      setError("Pick a topic or type your own.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const data = await postJSON<VulnResult>("/api/tools/vuln", { topic });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Explanation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <SectionLabel>Common topics</SectionLabel>

      <div className="flex flex-wrap gap-2">
        {TOPICS.map((topic) => (
          <Chip
            key={topic}
            active={selected === topic}
            onClick={() => {
              setSelected(topic);
              setCustom("");
              setError(null);
            }}
          >
            {topic}
          </Chip>
        ))}
      </div>

      <div className="flex flex-col gap-2.5">
        <SectionLabel>Or something custom</SectionLabel>
        <Input
          value={custom}
          onChange={(e) => {
            setCustom(e.target.value);
            setSelected(null);
          }}
          placeholder="e.g. JWT confusion, clickjacking…"
          aria-label="Custom vulnerability topic"
          className="h-11 rounded-xl border-white/10 bg-white/[0.04] text-[14px]"
        />
      </div>

      <PrimaryButton onClick={explain} loading={loading}>
        {loading ? "Explaining…" : "Explain"}
      </PrimaryButton>

      {error ? <ErrorText>{error}</ErrorText> : null}

      {loading ? (
        <div className="flex flex-col gap-3 pt-1">
          <ScanBar />
          <p className="text-center text-[12px] text-muted-foreground">{status}</p>
        </div>
      ) : null}

      {result ? (
        <FadeIn className="flex flex-col gap-4">
          <div className="rounded-2xl border border-neon/25 bg-neon/[0.04] p-4 box-glow">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-[17px] font-bold">{result.title}</h3>
              <SeverityBadge sev={result.severity} />
            </div>
            <p className="mt-2 text-[13.5px] leading-relaxed text-foreground/85">{result.description}</p>
          </div>

          <div className="flex flex-col gap-2">
            <SectionLabel>How it works</SectionLabel>
            <p className="text-[13px] leading-relaxed text-muted-foreground">{result.howItWorks}</p>
          </div>

          <div className="flex flex-col gap-2">
            <SectionLabel>Example</SectionLabel>
            <CodeBlock code={result.example} />
          </div>

          <div className="flex flex-col gap-2">
            <SectionLabel>How to prevent</SectionLabel>
            <ol className="list-decimal space-y-1.5 pl-5 marker:font-semibold marker:text-neon">
              {result.prevention.map((item, i) => (
                <li key={i} className="text-[13px] leading-relaxed text-foreground/85">
                  {item}
                </li>
              ))}
            </ol>
          </div>

          <ResultActions toolId="vuln-guide" result={result} />
        </FadeIn>
      ) : null}
    </div>
  );
}
