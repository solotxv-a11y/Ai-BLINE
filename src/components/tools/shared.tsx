"use client";

import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  BookmarkCheck,
  BookmarkPlus,
  ChevronRight,
  Copy,
  Info,
  Loader2,
} from "lucide-react";
import { SEVERITY_MAP, TOOLS } from "@/lib/colors";
import type { Finding, Severity, ToolDef } from "@/lib/types";
import { postJSON } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

/* ------------------------------------------------------------------ */
/* Lookups                                                             */
/* ------------------------------------------------------------------ */

export function getToolDef(toolId: string): ToolDef | undefined {
  return TOOLS.find((t) => t.id === toolId);
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export function PrimaryButton({ loading, children, className = "", ...props }: PrimaryButtonProps) {
  return (
    <button
      type="button"
      {...props}
      disabled={props.disabled || loading}
      className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-neon text-[14px] font-semibold text-black shadow-[0_0_24px_-4px_var(--neon)] transition hover:shadow-[0_0_32px_-2px_var(--neon)] active:scale-[0.99] disabled:opacity-40 ${className}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Banners / labels / chips                                            */
/* ------------------------------------------------------------------ */

export function SimulatedBanner({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] p-3 text-[12px] leading-relaxed text-amber-300/90">
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p>{text}</p>
    </div>
  );
}

export function SectionLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] text-neon/80 ${className}`}>
      {children}
    </p>
  );
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-[12.5px] transition ${
        active
          ? "border-neon/50 bg-neon/10 text-neon"
          : "border-white/10 bg-white/[0.04] text-foreground/80 hover:border-neon/40"
      }`}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Loading helpers                                                     */
/* ------------------------------------------------------------------ */

export function ScanBar() {
  return (
    <div
      className="relative h-1.5 overflow-hidden rounded-full bg-white/5 shimmer"
      role="status"
      aria-label="Working"
    >
      <div className="absolute h-full w-1/3 rounded-full bg-neon animate-[shimmer-x_1.5s_ease-in-out_infinite]" />
    </div>
  );
}

/** Rotates through status texts every 900 ms while `active`. */
export function useRotatingStatus(texts: readonly string[], active: boolean): string {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % texts.length), 900);
    return () => clearInterval(id);
  }, [active, texts]);

  if (!active) return texts[0] ?? "";
  return texts[index % texts.length] ?? texts[0] ?? "";
}

export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="text-[12.5px] leading-relaxed text-rose-400">
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Result building blocks                                              */
/* ------------------------------------------------------------------ */

export function FadeIn({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SeverityBadge({ sev }: { sev: Severity }) {
  const s = SEVERITY_MAP[sev];
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10.5px] font-semibold ${s.className}`}>
      {s.label}
    </span>
  );
}

export function FindingRow({ finding }: { finding: Finding }) {
  const s = SEVERITY_MAP[finding.level] ?? SEVERITY_MAP.info;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${s.dot}`} aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-[13.5px] font-semibold leading-snug">{finding.title}</p>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">{finding.detail}</p>
      </div>
    </div>
  );
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((tip, i) => (
        <li key={i} className="flex items-start gap-2">
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-neon" aria-hidden="true" />
          <span className="text-[13px] leading-relaxed text-foreground/85">{tip}</span>
        </li>
      ))}
    </ul>
  );
}

export function CodeBlock({ code, header }: { code: string; header?: string }) {
  const { toast } = useToast();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast({ title: "Copied to clipboard" });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  if (!header) {
    return (
      <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black/70 p-3.5 font-mono text-[12.5px] leading-relaxed text-foreground/90">
        {code}
      </pre>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-3.5 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {header}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy code"
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-white/5 hover:text-neon"
        >
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap bg-black/70 p-3.5 font-mono text-[12.5px] leading-relaxed text-foreground/90">
        {code}
      </pre>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Save / copy result actions                                          */
/* ------------------------------------------------------------------ */

export function ResultActions({ toolId, result }: { toolId: string; result: unknown }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const tool = getToolDef(toolId);

  const save = async () => {
    setSaving(true);
    try {
      await postJSON("/api/saved", {
        kind: "tool",
        title: `${tool?.name ?? toolId} — result`,
        content: JSON.stringify(result),
      });
      setSaved(true);
      toast({ title: "Saved to your library" });
    } catch (err) {
      toast({
        title: "Could not save",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      toast({ title: "Copied to clipboard" });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  return (
    <div className="flex gap-2.5">
      <button
        type="button"
        onClick={save}
        disabled={saving || saved}
        className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-neon/30 bg-neon/10 text-[13.5px] font-semibold text-neon transition hover:bg-neon/15 active:scale-[0.99] disabled:opacity-40"
      >
        {saved ? (
          <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
        ) : (
          <BookmarkPlus className="h-4 w-4" aria-hidden="true" />
        )}
        {saved ? "Saved" : "Save result"}
      </button>
      <button
        type="button"
        onClick={copy}
        className="inline-flex h-11 w-[104px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] text-[13.5px] font-semibold text-foreground/80 transition hover:border-neon/40 hover:text-neon active:scale-[0.99]"
      >
        <Copy className="h-4 w-4" aria-hidden="true" />
        Copy
      </button>
    </div>
  );
}
