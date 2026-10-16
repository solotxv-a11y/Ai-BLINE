"use client";

import { useRef, useState } from "react";
import { AlertTriangle, FileUp, Globe, Link2, ShieldCheck, ShieldX } from "lucide-react";
import type { LinkAnalysisResult } from "@/lib/types";
import { postJSON } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ErrorText,
  FadeIn,
  FindingRow,
  PrimaryButton,
  ResultActions,
  ScanBar,
  SectionLabel,
  useRotatingStatus,
} from "@/components/tools/shared";

const STATUSES = [
  "Checking URL structure…",
  "Scanning for phishing patterns…",
  "Analyzing content…",
  "Asking AI…",
] as const;

const MAX_FILE_CHARS = 6000;

const VERDICT_STYLES = {
  safe: {
    icon: ShieldCheck,
    label: "Looks Safe",
    text: "text-emerald-400",
    chip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    stroke: "#34d399",
  },
  suspicious: {
    icon: AlertTriangle,
    label: "Suspicious",
    text: "text-amber-400",
    chip: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    stroke: "#fbbf24",
  },
  dangerous: {
    icon: ShieldX,
    label: "Dangerous",
    text: "text-rose-400",
    chip: "border-rose-500/30 bg-rose-500/10 text-rose-400",
    stroke: "#fb7185",
  },
} as const;

const RING_R = 28;
const RING_CIRC = 2 * Math.PI * RING_R;

function ScoreRing({ score, stroke }: { score: number; stroke: string }) {
  const clamped = Math.max(0, Math.min(100, score));
  const offset = RING_CIRC * (1 - clamped / 100);
  return (
    <div className="relative h-16 w-16 shrink-0" role="img" aria-label={`Safety score ${clamped} of 100`}>
      <svg width={64} height={64} viewBox="0 0 64 64" className="-rotate-90">
        <circle cx={32} cy={32} r={RING_R} fill="none" strokeWidth={6} stroke="rgba(255,255,255,0.08)" />
        <circle
          cx={32}
          cy={32}
          r={RING_R}
          fill="none"
          strokeWidth={6}
          stroke={stroke}
          strokeLinecap="round"
          strokeDasharray={RING_CIRC}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.9s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-display text-xl font-bold">{Math.round(clamped)}</span>
      </div>
    </div>
  );
}

export default function LinkAnalyzer() {
  const [mode, setMode] = useState("url");
  const [url, setUrl] = useState("");
  const [fileText, setFileText] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LinkAnalysisResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const status = useRotatingStatus(STATUSES, loading);

  const onFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = (await file.text()).slice(0, MAX_FILE_CHARS);
      setFileText(text);
      setFileName(file.name);
    } catch {
      setError("Could not read that file. Try a plain text file.");
    }
    e.target.value = "";
  };

  const analyze = async () => {
    setError(null);
    if (mode === "url") {
      if (!url.trim()) {
        setError("Enter a URL to analyze.");
        return;
      }
    } else if (!fileText.trim()) {
      setError("Choose a file or paste some text first.");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const payload =
        mode === "url"
          ? { url: url.trim() }
          : { fileText: fileText.slice(0, MAX_FILE_CHARS), fileName: fileName || undefined };
      const data = await postJSON<LinkAnalysisResult>("/api/tools/link", payload);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const v = result ? VERDICT_STYLES[result.verdict] : null;
  const VerdictIcon = v?.icon ?? ShieldCheck;

  return (
    <div className="flex flex-col gap-4">
      <SectionLabel>Target</SectionLabel>

      <Tabs value={mode} onValueChange={setMode}>
        <TabsList className="grid h-10 w-full grid-cols-2 rounded-xl border border-white/10 bg-white/[0.04] p-1">
          <TabsTrigger
            value="url"
            className="h-8 rounded-lg text-[12.5px] font-medium data-[state=active]:bg-neon/15 data-[state=active]:text-neon"
          >
            <Link2 className="h-3.5 w-3.5" aria-hidden="true" /> Link
          </TabsTrigger>
          <TabsTrigger
            value="file"
            className="h-8 rounded-lg text-[12.5px] font-medium data-[state=active]:bg-neon/15 data-[state=active]:text-neon"
          >
            <FileUp className="h-3.5 w-3.5" aria-hidden="true" /> File / Text
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="mt-1">
          <div className="relative">
            <Globe
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/login"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              aria-label="URL to analyze"
              className="h-11 rounded-xl border-white/10 bg-white/[0.04] pl-9 text-[14px]"
            />
          </div>
        </TabsContent>

        <TabsContent value="file" className="mt-1 flex flex-col gap-2.5">
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,.json,.log,.csv"
            onChange={onFilePicked}
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
          />
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-[13px] font-medium transition hover:border-neon/40 hover:text-neon"
            >
              <FileUp className="h-4 w-4" aria-hidden="true" />
              Choose file
            </button>
            {fileName ? (
              <p className="min-w-0 truncate text-[12px] text-muted-foreground">{fileName}</p>
            ) : (
              <p className="text-[12px] text-muted-foreground">.txt, .md, .json, .log, .csv</p>
            )}
          </div>
          <Textarea
            value={fileText}
            onChange={(e) => setFileText(e.target.value)}
            placeholder="…or paste text here (scripts, logs, configs)"
            spellCheck={false}
            aria-label="Text content to analyze"
            className="min-h-[120px] rounded-xl border-white/10 bg-white/[0.04] font-mono text-[13px]"
          />
        </TabsContent>
      </Tabs>

      <PrimaryButton onClick={analyze} loading={loading}>
        {loading ? "Analyzing…" : "Analyze"}
      </PrimaryButton>

      {error ? <ErrorText>{error}</ErrorText> : null}

      {loading ? (
        <div className="flex flex-col gap-3 pt-1">
          <ScanBar />
          <p className="text-center text-[12px] text-muted-foreground">{status}</p>
        </div>
      ) : null}

      {result && v ? (
        <FadeIn className="flex flex-col gap-4">
          {/* Verdict hero */}
          <div className="flex items-center gap-4 rounded-2xl border border-neon/25 bg-neon/[0.04] p-4 box-glow">
            <VerdictIcon className={`h-7 w-7 shrink-0 ${v.text}`} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className={`text-lg font-bold ${v.text}`}>{v.label}</p>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted-foreground">
                Safety score out of 100
              </p>
            </div>
            <ScoreRing score={result.score} stroke={v.stroke} />
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

          <ResultActions toolId="link-analyzer" result={result} />
        </FadeIn>
      ) : null}
    </div>
  );
}
