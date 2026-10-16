"use client";

import { useState } from "react";
import { CheckCircle2, Database, Mail, ShieldCheck } from "lucide-react";
import type { LeakResult } from "@/lib/types";
import { postJSON } from "@/lib/api";
import { Input } from "@/components/ui/input";
import {
  BulletList,
  ErrorText,
  FadeIn,
  PrimaryButton,
  ResultActions,
  ScanBar,
  SectionLabel,
  SeverityBadge,
  useRotatingStatus,
} from "@/components/tools/shared";

const STATUSES = [
  "Querying breach datasets…",
  "Cross-checking records…",
  "Compiling your report…",
] as const;

export default function DataLeak() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LeakResult | null>(null);

  const status = useRotatingStatus(STATUSES, loading);

  const check = async () => {
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const data = await postJSON<LeakResult>("/api/tools/leak", { email: value });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <SectionLabel>Email to check</SectionLabel>

      <div className="relative">
        <Mail
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          type="email"
          inputMode="email"
          autoComplete="off"
          aria-label="Email address to check"
          className="h-11 rounded-xl border-white/10 bg-white/[0.04] pl-9 text-[14px]"
        />
      </div>

      <PrimaryButton onClick={check} loading={loading}>
        {loading ? "Checking…" : "Check for leaks"}
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
          {result.found ? (
            <>
              <div className="flex items-center gap-3 rounded-2xl border border-neon/25 bg-neon/[0.04] p-4 box-glow">
                <Database className="h-7 w-7 shrink-0 text-amber-400" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-lg font-bold">
                    {result.breaches.length} exposure{result.breaches.length === 1 ? "" : "s"} found
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                    Simulated demo records for {result.email}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                {result.breaches.map((b, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[14px] font-semibold">{b.name}</p>
                      <SeverityBadge sev={b.severity} />
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{b.date}</p>
                    {b.dataTypes.length > 0 ? (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {b.dataTypes.map((t, j) => (
                          <span
                            key={j}
                            className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10.5px] text-foreground/80"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
              <div>
                <p className="text-[14px] font-semibold text-emerald-400">
                  No exposure found in the demo dataset
                </p>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">
                  This address does not appear in the simulated breach data. Staying careful still pays
                  off.
                </p>
              </div>
            </div>
          )}

          {result.tips.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              <SectionLabel>Stay safe</SectionLabel>
              <BulletList items={result.tips} />
            </div>
          ) : null}

          <ResultActions toolId="data-leak" result={result} />
        </FadeIn>
      ) : null}

      {!result && !loading ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5 text-[12px] leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-neon" aria-hidden="true" />
          <p>
            Learn how breach checks work: results show what kind of data typically leaks and what to do
            next — change passwords, enable 2FA and watch for phishing.
          </p>
        </div>
      ) : null}
    </div>
  );
}
