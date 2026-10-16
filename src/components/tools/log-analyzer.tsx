"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import type { LogAnalysisResult } from "@/lib/types";
import { postJSON } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import {
  ErrorText,
  FadeIn,
  FindingRow,
  PrimaryButton,
  ResultActions,
  ScanBar,
  SectionLabel,
  SeverityBadge,
  useRotatingStatus,
} from "@/components/tools/shared";

const STATUSES = [
  "Parsing log lines…",
  "Grouping errors & warnings…",
  "Finding root causes…",
] as const;

const SAMPLE_LOG = `2024-05-17 08:02:11 INFO  web-1  GET /health 200 12ms
2024-05-17 08:02:14 INFO  auth   Session created for user=1042
2024-05-17 08:03:02 WARN  db     Connection pool at 92% capacity (46/50)
2024-05-17 08:03:19 INFO  web-1  GET /api/orders 200 38ms
2024-05-17 08:04:44 ERROR db     Connection timeout after 30000ms host=10.0.0.12:5432
2024-05-17 08:04:45 WARN  web-2  Retrying DB connection (attempt 2/5)
2024-05-17 08:05:03 INFO  web-1  GET /api/orders 200 41ms
2024-05-17 08:05:47 ERROR auth   Failed login for user=admin ip=203.0.113.7 (invalid password)
2024-05-17 08:05:52 ERROR auth   Failed login for user=admin ip=203.0.113.7 (invalid password)
2024-05-17 08:05:58 ERROR auth   Failed login for user=admin ip=203.0.113.7 (invalid password)
2024-05-17 08:06:10 WARN  auth   Rate limit triggered for ip=203.0.113.7
2024-05-17 08:07:22 INFO  worker Invoice job #8812 completed in 3.4s
2024-05-17 08:08:41 ERROR web-1  Unhandled exception: TypeError: Cannot read properties of undefined (reading 'id') at OrderService.java:214
2024-05-17 08:08:42 WARN  web-1  500 returned to client req=8f31c2
2024-05-17 08:09:15 WARN  sys    Memory usage high: 91% (7.3/8.0 GB) — OOM risk
2024-05-17 08:10:02 INFO  web-2  GET /api/orders 200 36ms
2024-05-17 08:10:33 ERROR db     Connection timeout after 30000ms host=10.0.0.12:5432
2024-05-17 08:11:20 WARN  worker Email queue depth = 1240, throttling producers
2024-05-17 08:12:05 INFO  sys    Nightly backup started (target=s3://backups/prod)
2024-05-17 08:13:44 ERROR web-2  Upstream payments-gw returned 503 (circuit breaker OPEN)`;

export default function LogAnalyzer() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LogAnalysisResult | null>(null);

  const status = useRotatingStatus(STATUSES, loading);

  const analyze = async () => {
    if (!text.trim()) {
      setError("Paste some log lines first — or load the sample.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const data = await postJSON<LogAnalysisResult>("/api/tools/log", { text: text.slice(0, 6000) });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <SectionLabel>Log text</SectionLabel>
        <button
          type="button"
          onClick={() => {
            setText(SAMPLE_LOG);
            setError(null);
          }}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-transparent px-3 text-[12px] font-medium text-muted-foreground transition hover:border-neon/40 hover:text-neon"
        >
          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
          Load sample
        </button>
      </div>

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={"2024-05-17 08:04:44 ERROR db  Connection timeout after 30000ms\n2024-05-17 08:04:45 WARN  web-2  Retrying DB connection…"}
        spellCheck={false}
        aria-label="Logs to analyze"
        className="min-h-[200px] rounded-xl border-white/10 bg-white/[0.04] font-mono text-[12px]"
      />

      <PrimaryButton onClick={analyze} loading={loading}>
        {loading ? "Analyzing…" : "Analyze logs"}
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
          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3 text-center">
              <p className="font-display text-2xl font-bold text-rose-400">{result.counts.error}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Errors</p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3 text-center">
              <p className="font-display text-2xl font-bold text-amber-400">{result.counts.warning}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Warnings</p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3 text-center">
              <p className="font-display text-2xl font-bold text-sky-400">{result.counts.info}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Info</p>
            </div>
          </div>

          {/* Overall severity */}
          <div className="flex items-center justify-between rounded-2xl border border-neon/25 bg-neon/[0.04] p-4 box-glow">
            <p className="text-[13.5px] font-semibold">Overall severity</p>
            <SeverityBadge sev={result.severity} />
          </div>

          {result.findings.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              <SectionLabel>Findings</SectionLabel>
              {result.findings.map((f, i) => (
                <FindingRow key={i} finding={f} />
              ))}
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <SectionLabel>Summary</SectionLabel>
            <p className="text-[13.5px] leading-relaxed text-foreground/85">{result.summary}</p>
          </div>

          {result.fixes.length > 0 ? (
            <div className="flex flex-col gap-2">
              <SectionLabel>Suggested fixes</SectionLabel>
              <ol className="list-decimal space-y-1.5 pl-5 marker:font-semibold marker:text-neon">
                {result.fixes.map((fix, i) => (
                  <li key={i} className="text-[13px] leading-relaxed text-foreground/85">
                    {fix}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          <ResultActions toolId="log-analyzer" result={result} />
        </FadeIn>
      ) : null}
    </div>
  );
}
