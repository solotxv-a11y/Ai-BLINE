"use client";

import { Check, Moon, Activity } from "lucide-react";
import { useAppStore, applyAppearance, type AccentChoice } from "@/lib/store";
import { LogoMark } from "@/components/app/logo";
import { Switch } from "@/components/ui/switch";
import { SectionLabel, ViewHeader } from "./parts";

const ACCENTS: { value: AccentChoice; color: string; name: string }[] = [
  { value: "neon", color: "#2ee6c8", name: "Neon Mint" },
  { value: "violet", color: "#a78bfa", name: "Ultra Violet" },
  { value: "green", color: "#34d399", name: "Cyber Green" },
  { value: "rose", color: "#fb7185", name: "Hyper Rose" },
];

export default function AppearanceView() {
  const { accent, setAccent, amoled, setAmoled, reduceMotion, setReduceMotion } = useAppStore();
  const activeName = ACCENTS.find((a) => a.value === accent)?.name ?? "Neon Mint";

  return (
    <div className="px-5 pt-5 pb-8">
      <ViewHeader title="Appearance" subtitle="Make Ai BLINE yours" />

      {/* accent color */}
      <SectionLabel>Accent Color</SectionLabel>
      <div className="mt-3 flex items-center justify-between px-1">
        {ACCENTS.map((a) => {
          const active = accent === a.value;
          return (
            <button
              key={a.value}
              type="button"
              aria-label={`Accent: ${a.name}`}
              aria-pressed={active}
              onClick={() => {
                setAccent(a.value);
                applyAppearance();
              }}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 transition"
              style={{
                backgroundColor: a.color,
                color: a.color,
                borderColor: active ? "rgba(255,255,255,0.7)" : "transparent",
                boxShadow: active ? "0 0 14px -2px currentColor" : undefined,
                opacity: active ? 1 : 0.8,
              }}
            >
              {active ? <Check className="h-4 w-4 text-black" /> : null}
            </button>
          );
        })}
      </div>

      {/* display */}
      <SectionLabel className="mt-6">Display</SectionLabel>
      <div className="mt-3 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] divide-y divide-white/[0.06]">
        <div className="flex items-center gap-3.5 px-4 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-foreground/80">
            <Moon className="h-4.5 w-4.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14.5px] font-medium">AMOLED true black</span>
            <span className="mt-0.5 block text-[11.5px] text-muted-foreground">Pure black background for OLED screens</span>
          </span>
          <Switch checked={amoled} onCheckedChange={setAmoled} aria-label="Toggle AMOLED true black" />
        </div>
        <div className="flex items-center gap-3.5 px-4 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-foreground/80">
            <Activity className="h-4.5 w-4.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14.5px] font-medium">Reduce motion</span>
            <span className="mt-0.5 block text-[11.5px] text-muted-foreground">Minimize animations</span>
          </span>
          <Switch checked={reduceMotion} onCheckedChange={setReduceMotion} aria-label="Toggle reduce motion" />
        </div>
      </div>

      {/* preview */}
      <SectionLabel className="mt-6">Preview</SectionLabel>
      <div className="mt-3 rounded-2xl border border-neon/30 bg-neon/[0.05] p-4 box-glow">
        <div className="flex items-center gap-3">
          <LogoMark size={26} glow />
          <div>
            <p className="font-display font-bold text-neon text-glow">Ai BLINE</p>
            <p className="text-[11px] text-muted-foreground">{activeName}</p>
          </div>
        </div>
        <button
          type="button"
          tabIndex={-1}
          className="mt-3 h-9 rounded-lg bg-neon px-4 text-[12.5px] font-semibold text-black"
        >
          Sample Button
        </button>
      </div>
    </div>
  );
}
