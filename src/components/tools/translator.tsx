"use client";

import { useState } from "react";
import { Copy, Languages } from "lucide-react";
import type { TranslateResult } from "@/lib/types";
import { postJSON } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  BulletList,
  Chip,
  ErrorText,
  FadeIn,
  PrimaryButton,
  ResultActions,
  ScanBar,
  SectionLabel,
  useRotatingStatus,
} from "@/components/tools/shared";

const DOMAINS = ["General", "Security", "Programming"] as const;

const LANGUAGES = [
  "English",
  "Persian",
  "Arabic",
  "Turkish",
  "German",
  "French",
  "Spanish",
  "Russian",
  "Chinese",
] as const;

const STATUSES = [
  "Understanding context…",
  "Translating…",
  "Polishing terminology…",
] as const;

export default function Translator() {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [domain, setDomain] = useState<string>("General");
  const [targetLang, setTargetLang] = useState<string>("Persian");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TranslateResult | null>(null);

  const status = useRotatingStatus(STATUSES, loading);

  const translate = async () => {
    if (!text.trim()) {
      setError("Enter the text you want to translate.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const data = await postJSON<TranslateResult>("/api/tools/translate", {
        text: text.slice(0, 5000),
        domain,
        targetLang,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Translation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyTranslation = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.translation);
      toast({ title: "Copied to clipboard" });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <SectionLabel>Text</SectionLabel>

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste or type the text to translate…"
        aria-label="Text to translate"
        className="min-h-[130px] rounded-xl border-white/10 bg-white/[0.04] text-[14px]"
      />

      <div className="flex flex-col gap-2.5">
        <SectionLabel>Domain</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {DOMAINS.map((d) => (
            <Chip key={d} active={domain === d} onClick={() => setDomain(d)}>
              {d}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <SectionLabel>Translate to</SectionLabel>
        <Select value={targetLang} onValueChange={setTargetLang}>
          <SelectTrigger
            aria-label="Target language"
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
      </div>

      <PrimaryButton onClick={translate} loading={loading}>
        {loading ? "Translating…" : "Translate"}
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
            <div className="flex items-start justify-between gap-2.5">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-neon/80">
                <Languages className="h-3.5 w-3.5" aria-hidden="true" />
                {targetLang}
              </p>
              <button
                type="button"
                onClick={copyTranslation}
                aria-label="Copy translation"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-muted-foreground transition hover:border-neon/40 hover:text-neon"
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-foreground/95">{result.translation}</p>
          </div>

          {result.notes.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              <SectionLabel>Translation notes</SectionLabel>
              <BulletList items={result.notes} />
            </div>
          ) : null}

          <ResultActions toolId="translator" result={result} />
        </FadeIn>
      ) : null}
    </div>
  );
}
