"use client";

import { useState } from "react";
import type { CodeReviewResult } from "@/lib/types";
import { postJSON } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
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

const LANGUAGES = [
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
] as const;

const STATUSES = [
  "Reading your code…",
  "Hunting bugs & security issues…",
  "Writing the improved version…",
] as const;

const PLACEHOLDER = `// Tiny buggy example — paste your own code
function login(user, pw) {
  const q = "SELECT * FROM users WHERE name='" + user + "' AND pw='" + pw + "'";
  db.exec(q);
  if (user == "admin") grantAdmin();
}`;

export default function CodeHelper() {
  const [language, setLanguage] = useState<string>("TypeScript");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CodeReviewResult | null>(null);

  const status = useRotatingStatus(STATUSES, loading);

  const analyze = async () => {
    if (!code.trim()) {
      setError("Paste some code first.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const data = await postJSON<CodeReviewResult>("/api/tools/code", {
        code: code.slice(0, 6000),
        language,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <SectionLabel>Language</SectionLabel>

      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger
          aria-label="Programming language"
          className="h-11 w-full rounded-xl border-white/10 bg-white/[0.04] text-[14px]"
        >
          <SelectValue placeholder="Pick a language" />
        </SelectTrigger>
        <SelectContent className="border-white/10 bg-popover">
          {LANGUAGES.map((lang) => (
            <SelectItem key={lang} value={lang} className="text-[13.5px]">
              {lang}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex flex-col gap-2.5">
        <SectionLabel>Your code</SectionLabel>
        <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={PLACEHOLDER}
          spellCheck={false}
          aria-label="Code to analyze"
          className="min-h-[180px] rounded-xl border-white/10 bg-white/[0.04] font-mono text-[13px]"
        />
      </div>

      <PrimaryButton onClick={analyze} loading={loading}>
        {loading ? "Analyzing…" : "Analyze code"}
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
          <div className="flex flex-col gap-2.5">
            <SectionLabel>Issues ({result.issues.length})</SectionLabel>
            {result.issues.length === 0 ? (
              <p className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] p-3.5 text-[13px] text-emerald-400">
                No obvious issues found — nice code!
              </p>
            ) : (
              result.issues.map((issue, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
                >
                  <span className="mt-0.5 shrink-0">
                    <SeverityBadge sev={issue.severity} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold leading-snug">{issue.title}</p>
                    <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">
                      {issue.detail}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-col gap-2">
            <SectionLabel>Suggested version</SectionLabel>
            <CodeBlock code={result.improvedCode} header="Improved code" />
          </div>

          <div className="flex flex-col gap-2">
            <SectionLabel>Explanation</SectionLabel>
            <p className="text-[13.5px] leading-relaxed text-foreground/85">{result.explanation}</p>
          </div>

          <ResultActions toolId="code-helper" result={result} />
        </FadeIn>
      ) : null}
    </div>
  );
}
