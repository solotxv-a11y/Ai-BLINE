"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Wifi } from "lucide-react";
import type { ScanResult } from "@/lib/types";
import { postJSON } from "@/lib/api";
import { Input } from "@/components/ui/input";
import {
  Chip,
  ErrorText,
  FadeIn,
  PrimaryButton,
  ResultActions,
  ScanBar,
  SectionLabel,
  SeverityBadge,
} from "@/components/tools/shared";

const STEPS = ["ARP sweep", "Port probing", "OS fingerprinting", "Compiling report"] as const;

const PRESETS = ["192.168.1.0/24", "10.0.0.0/24", "192.168.0.1"] as const;

export default function NetworkScanner() {
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  // Keep a handle on any running fetch so we never set state after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Staged progress animation: one step every 900 ms while scanning
  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 900);
    return () => clearInterval(id);
  }, [loading]);

  const startScan = async () => {
    const value = target.trim();
    if (!value) {
      setError("Enter a target range or IP first.");
      return;
    }
    setError(null);
    setResult(null);
    setStep(0);
    setLoading(true);
    try {
      const data = await postJSON<ScanResult>("/api/tools/scan", { target: value });
      if (mountedRef.current) setResult(data);
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : "Scan failed. Please try again.");
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <SectionLabel>Target range or IP</SectionLabel>

      <div className="relative">
        <Wifi
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="192.168.1.0/24"
          aria-label="Network target"
          className="h-11 rounded-xl border-white/10 bg-white/[0.04] pl-9 font-mono text-[14px]"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <Chip
            key={preset}
            active={target === preset}
            onClick={() => {
              setTarget(preset);
              setError(null);
            }}
          >
            <span className="font-mono">{preset}</span>
          </Chip>
        ))}
      </div>

      <PrimaryButton onClick={startScan} loading={loading}>
        {loading ? "Scanning…" : "Start Scan"}
      </PrimaryButton>

      {error ? <ErrorText>{error}</ErrorText> : null}

      {loading ? (
        <div className="flex flex-col gap-3.5 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
          <ScanBar />
          <ul className="flex flex-col gap-2.5">
            {STEPS.map((label, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <li key={label} className="flex items-center gap-2.5">
                  {done ? (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-neon/15">
                      <Check className="h-3 w-3 text-neon" aria-hidden="true" />
                    </span>
                  ) : active ? (
                    <Loader2 className="h-4 w-4 animate-spin text-neon" aria-hidden="true" />
                  ) : (
                    <span className="h-4 w-4 rounded-full border border-white/15" aria-hidden="true" />
                  )}
                  <span
                    className={`text-[13px] ${
                      done ? "text-foreground/85" : active ? "text-neon" : "text-muted-foreground/60"
                    }`}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {result ? (
        <FadeIn className="flex flex-col gap-4">
          <div className="rounded-2xl border border-neon/25 bg-neon/[0.04] p-4 box-glow">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[15px] font-bold">{result.hosts.length} devices found</p>
              <span className="font-mono text-[11px] text-muted-foreground">{result.target}</span>
            </div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/85">{result.summary}</p>
          </div>

          <div className="flex flex-col gap-2.5">
            <SectionLabel>Discovered devices</SectionLabel>
            {result.hosts.map((host, i) => (
              <div
                key={`${host.ip}-${i}`}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-[15px] font-bold text-neon">{host.ip}</p>
                  <SeverityBadge sev={host.risk} />
                </div>
                {host.hostname ? (
                  <p className="mt-0.5 text-[12.5px] text-foreground/80">{host.hostname}</p>
                ) : null}
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                  {host.mac}
                  {host.vendor ? ` · ${host.vendor}` : ""}
                </p>
                {host.os ? <p className="mt-0.5 text-[11.5px] text-muted-foreground">{host.os}</p> : null}
                {host.openPorts.length > 0 ? (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {host.openPorts.map((p, j) => (
                      <span
                        key={`${p.port}-${j}`}
                        className="rounded-md bg-white/[0.06] px-2 py-0.5 font-mono text-[10.5px] text-foreground/80"
                      >
                        {p.port}/{p.service}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-[11.5px] text-muted-foreground">No open ports detected</p>
                )}
              </div>
            ))}
          </div>

          <ResultActions toolId="network-scanner" result={result} />
        </FadeIn>
      ) : null}
    </div>
  );
}
