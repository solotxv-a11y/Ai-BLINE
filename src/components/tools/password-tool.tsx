"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { PrimaryButton, ResultActions, SectionLabel } from "@/components/tools/shared";

/* ------------------------------------------------------------------ */
/* Generation logic (crypto-secure, client-side only)                  */
/* ------------------------------------------------------------------ */

const SETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?/",
} as const;

const AMBIGUOUS = new Set(["l", "1", "I", "O", "0"]);

interface PwOptions {
  upper: boolean;
  lower: boolean;
  digits: boolean;
  symbols: boolean;
  noAmbiguous: boolean;
}

const DEFAULT_OPTIONS: PwOptions = {
  upper: true,
  lower: true,
  digits: true,
  symbols: true,
  noAmbiguous: false,
};

function filterSet(set: string, noAmbiguous: boolean): string {
  if (!noAmbiguous) return set;
  return Array.from(set)
    .filter((ch) => !AMBIGUOUS.has(ch))
    .join("");
}

function activeSets(opts: PwOptions): string[] {
  const parts: string[] = [];
  if (opts.upper) parts.push(filterSet(SETS.upper, opts.noAmbiguous));
  if (opts.lower) parts.push(filterSet(SETS.lower, opts.noAmbiguous));
  if (opts.digits) parts.push(filterSet(SETS.digits, opts.noAmbiguous));
  if (opts.symbols) parts.push(filterSet(SETS.symbols, opts.noAmbiguous));
  const nonEmpty = parts.filter((p) => p.length > 0);
  return nonEmpty.length > 0 ? nonEmpty : [SETS.lower];
}

/** Unbiased random integer in [0, max) using rejection sampling. */
function randomInt(max: number): number {
  const range = 4294967296; // 2^32
  const limit = range - (range % max);
  const buf = new Uint32Array(1);
  let value = 0;
  do {
    crypto.getRandomValues(buf);
    value = buf[0] as number;
  } while (value >= limit);
  return value % max;
}

function generatePassword(length: number, opts: PwOptions): string {
  const pool = activeSets(opts).join("");
  const sets = activeSets(opts);
  const chars: string[] = [];

  for (let i = 0; i < length; i++) {
    chars.push(pool[randomInt(pool.length)] as string);
  }

  // Guarantee at least one character from every active set
  sets.forEach((set, idx) => {
    const present = chars.some((c) => set.includes(c));
    if (!present) {
      const position = (idx * randomInt(length) + randomInt(length)) % length;
      chars[position] = set[randomInt(set.length)] as string;
    }
  });

  // Fisher–Yates shuffle with crypto randomness
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    const tmp = chars[i] as string;
    chars[i] = chars[j] as string;
    chars[j] = tmp;
  }

  return chars.join("");
}

function strengthMeta(entropy: number) {
  if (entropy < 45) {
    return {
      label: "Weak",
      text: "text-rose-400",
      bar: "bg-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.45)]",
    };
  }
  if (entropy < 70) {
    return {
      label: "Good",
      text: "text-amber-400",
      bar: "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.45)]",
    };
  }
  if (entropy < 90) {
    return { label: "Strong", text: "text-neon", bar: "bg-neon shadow-[0_0_12px_var(--neon)]" };
  }
  return {
    label: "Excellent",
    text: "text-emerald-400",
    bar: "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.45)]",
  };
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const TIPS = [
  "Longer is stronger — every extra character multiplies the search space.",
  "Never reuse passwords across important accounts.",
  "Store passwords in a password manager instead of memorizing them all.",
  "Turn on 2FA so a leaked password alone can't unlock your account.",
];

interface PwToggle {
  key: keyof PwOptions;
  label: string;
}

const TOGGLES: PwToggle[] = [
  { key: "upper", label: "Uppercase (A–Z)" },
  { key: "lower", label: "Lowercase (a–z)" },
  { key: "digits", label: "Digits (0–9)" },
  { key: "symbols", label: "Symbols (!@#$)" },
  { key: "noAmbiguous", label: "Avoid ambiguous (l, 1, I, O, 0)" },
];

export default function PasswordTool() {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState<PwOptions>(DEFAULT_OPTIONS);

  const generate = useCallback(() => {
    setPassword(generatePassword(length, opts));
  }, [length, opts]);

  // Hydration-safe: first password is only generated after mount (async so the
  // server HTML matches the first client render)
  useEffect(() => {
    const id = setTimeout(() => {
      setPassword(generatePassword(16, DEFAULT_OPTIONS));
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const pool = useMemo(() => activeSets(opts).join(""), [opts]);
  const entropy = length * Math.log2(Math.max(2, pool.length));
  const meta = strengthMeta(entropy);

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(password);
      toast({ title: "Password copied" });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const saveResult = password
    ? { password, length, entropyBits: Math.round(entropy), strength: meta.label }
    : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Password display */}
      <div className="rounded-2xl border border-neon/25 bg-neon/[0.05] p-4 text-center">
        <p
          className={`break-all font-mono text-[17px] leading-relaxed tracking-wide ${
            password ? "text-foreground" : "text-muted-foreground/50"
          }`}
          aria-live="polite"
          aria-label="Generated password"
        >
          {password || "••••••••••••"}
        </p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={copyPassword}
            disabled={!password}
            aria-label="Copy password"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-muted-foreground transition hover:border-neon/40 hover:text-neon disabled:opacity-40"
          >
            <Copy className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={generate}
            aria-label="Regenerate password"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-muted-foreground transition hover:border-neon/40 hover:text-neon"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Strength meter */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-[13px] font-bold ${meta.text}`}>{meta.label}</span>
            <span className="text-[11px] text-muted-foreground">~{Math.round(entropy)} bits</span>
          </div>
          <span className="text-[11px] text-muted-foreground">{length} characters</span>
        </div>
        <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full transition-all duration-500 ${meta.bar}`}
            style={{ width: `${Math.min(100, entropy)}%` }}
            role="progressbar"
            aria-valuenow={Math.round(Math.min(100, entropy))}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Password strength"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
        <div className="flex items-center justify-between">
          <SectionLabel>Length</SectionLabel>
          <span className="font-mono text-[13px] text-neon">{length}</span>
        </div>
        <Slider
          value={[length]}
          onValueChange={(values) => setLength(values[0] ?? 16)}
          min={8}
          max={64}
          step={1}
          aria-label="Password length"
          className="mt-3"
        />

        <div className="mt-4 flex flex-col gap-3 border-t border-white/[0.06] pt-4">
          {TOGGLES.map((t) => (
            <div key={t.key} className="flex items-center justify-between gap-3">
              <span id={`pw-${t.key}`} className="text-[13px] text-foreground/85">
                {t.label}
              </span>
              <Switch
                checked={opts[t.key]}
                onCheckedChange={(checked) => setOpts((o) => ({ ...o, [t.key]: checked }))}
                aria-labelledby={`pw-${t.key}`}
              />
            </div>
          ))}
        </div>
      </div>

      <PrimaryButton onClick={generate}>
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Generate new password
      </PrimaryButton>

      {/* Tips */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
        <SectionLabel className="mb-2.5">Tips</SectionLabel>
        <ul className="space-y-1.5">
          {TIPS.map((tip, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-[12.5px] leading-relaxed text-muted-foreground"
            >
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-neon" aria-hidden="true" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {saveResult ? <ResultActions toolId="password" result={saveResult} /> : null}
    </div>
  );
}
