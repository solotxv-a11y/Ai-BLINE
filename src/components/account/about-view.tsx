"use client";

import { Github, Scale } from "lucide-react";
import { LogoMark } from "@/components/app/logo";
import { ViewHeader } from "./parts";

const TECH = ["Next.js 16", "TypeScript", "Tailwind CSS 4", "shadcn/ui", "Prisma", "SQLite"];

export default function AboutView() {
  return (
    <div className="px-5 pt-5 pb-8">
      <ViewHeader title="About" subtitle="Meet Ai BLINE" />

      {/* hero */}
      <div className="flex flex-col items-center pt-2 text-center">
        <LogoMark size={64} glow className="animate-float" />
        <h2 className="mt-4 font-display text-2xl font-bold">Ai BLINE</h2>
        <p className="mt-1 text-[12px] text-muted-foreground">v1.0.0 — Black Line build</p>
        <p className="mt-4 text-[13px] leading-relaxed text-foreground/80">
          Ai BLINE is your pocket AI security assistant — chat with specialist agents, learn ethical hacking step by
          step in the Academy, run safe defensive tools, and keep everything organized in your account. Built as an
          open-source sample of a full-stack AI mobile app.
        </p>
      </div>

      {/* tech chips */}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {TECH.map((t) => (
          <span
            key={t}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-foreground/75"
          >
            {t}
          </span>
        ))}
      </div>

      {/* github */}
      <a
        href="https://github.com/your-username/ai-bline"
        target="_blank"
        rel="noreferrer"
        className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] text-[13.5px] font-medium transition hover:border-neon/40 hover:text-neon"
      >
        <Github className="h-4 w-4" />
        View source on GitHub
      </a>

      {/* disclaimer */}
      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400">
          <Scale className="h-4.5 w-4.5" />
        </span>
        <div>
          <p className="text-[13px] font-semibold text-amber-300">Educational use only</p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            Ai BLINE is an educational sample project. All security content is legal &amp; defensive only — never use
            techniques on systems you don&apos;t own.
          </p>
        </div>
      </div>

      <p className="mt-6 text-center text-[11px] text-muted-foreground/60">Made with ⚡ • Powered by Z.ai SDK</p>
    </div>
  );
}
