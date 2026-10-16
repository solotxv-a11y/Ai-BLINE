"use client";

import { Check, Globe, Languages } from "lucide-react";

export default function LanguageView() {
  return (
    <div className="px-5 pt-5 pb-8">
      <h1 className="font-display text-[22px] font-bold tracking-tight">Language</h1>
      <p className="mt-1 text-[13px] text-muted-foreground">Interface language</p>

      <div className="mt-5 flex flex-col gap-3">
        {/* English — active */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-neon/40 bg-neon/[0.05] p-4 transition-all">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neon/30 bg-neon/10 text-neon">
            <Globe className="h-4.5 w-4.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14.5px] font-medium">English</span>
            <span className="mt-0.5 block text-[11.5px] text-muted-foreground">Default</span>
          </span>
          <Check className="h-4 w-4 shrink-0 text-neon" />
        </div>

        {/* Persian — soon */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 opacity-50 transition-all">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-foreground/80">
            <Globe className="h-4.5 w-4.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14.5px] font-medium">Persian</span>
            <span className="mt-0.5 block text-[11.5px] text-muted-foreground">فارسی</span>
          </span>
          <span className="shrink-0 rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-muted-foreground">Soon</span>
        </div>

        {/* Arabic — soon */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 opacity-50 transition-all">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-foreground/80">
            <Globe className="h-4.5 w-4.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14.5px] font-medium">Arabic</span>
            <span className="mt-0.5 block text-[11.5px] text-muted-foreground">العربية</span>
          </span>
          <span className="shrink-0 rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-muted-foreground">Soon</span>
        </div>
      </div>

      {/* note */}
      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-foreground/80">
          <Languages className="h-4.5 w-4.5" />
        </span>
        <p className="text-[12px] leading-relaxed text-muted-foreground">
          Ai BLINE&apos;s interface is English today; more languages are on the roadmap.
        </p>
      </div>
    </div>
  );
}
