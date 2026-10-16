"use client";

import {
  MessageSquare,
  Bot,
  GraduationCap,
  Wrench,
  ShieldCheck,
  Github,
  Zap,
} from "lucide-react";
import { LogoMark } from "@/components/app/logo";

const FEATURES = [
  {
    icon: MessageSquare,
    title: "AI Chat",
    desc: "Ask anything about security, devices or code — with markdown & code blocks.",
  },
  {
    icon: Bot,
    title: "Expert Agents",
    desc: "Security Advisor, Pentest Mentor, Computer Expert, Code Assistant, Researcher.",
  },
  {
    icon: GraduationCap,
    title: "Pentest Academy",
    desc: "Legal & ethical training paths with progress tracking and a practice lab.",
  },
  {
    icon: Wrench,
    title: "Security Toolbox",
    desc: "Link analyzer, leak check, password generator, log analyzer and more.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy First",
    desc: "Local-first history, no trackers, dark AMOLED display built in.",
  },
];

/** Marketing side panel — desktop (xl+) only */
export function SidePanel() {
  return (
    <aside className="hidden xl:flex max-w-[440px] flex-col gap-9 select-none">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <LogoMark size={44} glow />
          <span className="font-display text-3xl font-bold tracking-tight">
            Ai <span className="text-neon text-glow">BLINE</span>
          </span>
        </div>
        <h1 className="font-display text-4xl font-bold leading-tight">
          Your AI copilot for <span className="text-neon">security</span>, learning &amp; everyday
          computer work.
        </h1>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          A full-featured, open-source assistant: chat with expert agents, train in the Pentest
          Academy, and run a complete security toolbox — wrapped in a mobile-first, black-line neon
          design.
        </p>
      </div>

      <ul className="flex flex-col gap-3.5">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <li key={title} className="flex items-start gap-3.5">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neon/25 bg-neon/[0.07] text-neon icon-glow">
              <Icon className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-[13px] leading-snug text-muted-foreground">{desc}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3">
        <a
          href="https://github.com/your-username/ai-bline"
          target="_blank"
          rel="noreferrer"
          className="glass flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all hover:border-neon/40 hover:text-neon"
        >
          <Github className="h-4 w-4" /> Star on GitHub
        </a>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Zap className="h-3.5 w-3.5 text-neon" /> Open the demo on the right →
        </span>
      </div>

      <p className="text-[11px] text-muted-foreground/70">
        Ai BLINE v1.0.0 • Built with Next.js, Tailwind CSS &amp; shadcn/ui • For educational and
        defensive security use only.
      </p>
    </aside>
  );
}
