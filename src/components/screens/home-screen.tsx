"use client";

import { useEffect, useState } from "react";
import {
  ChevronRight,
  GraduationCap,
  Laptop,
  Link2,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { COLOR_MAP } from "@/lib/colors";
import { GENERAL_AGENT } from "@/lib/agents";
import { getJSON } from "@/lib/api";
import type { AccentKey, HistorySession } from "@/lib/types";
import { ChatView } from "@/components/chat/chat-view";

export default function HomeScreen() {
  // Top view of the home tab's stack: "menu" → home menu, "chat" → chat view
  const top = useAppStore((s) => {
    const stack = s.stacks.home;
    return stack[stack.length - 1];
  });

  if (top.name === "chat") return <ChatView />;
  return <HomeMenu />;
}

function HomeMenu() {
  const push = useAppStore((s) => s.push);
  const setTab = useAppStore((s) => s.setTab);
  const openTool = useAppStore((s) => s.openTool);
  const openChat = useAppStore((s) => s.openChat);
  const [recent, setRecent] = useState<HistorySession[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getJSON<{ sessions: HistorySession[] }>("/api/history")
      .then((d) => {
        if (!cancelled) setRecent(d.sessions.slice(0, 3));
      })
      .catch(() => {
        if (!cancelled) setRecent([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const quickActions: {
    label: string;
    icon: LucideIcon;
    color: AccentKey;
    run: () => void;
  }[] = [
    {
      label: "Security & Privacy",
      icon: ShieldCheck,
      color: "neon",
      run: () => push("chat", { seed: "How can I secure my phone and my online accounts step by step?" }),
    },
    {
      label: "Pentest Learning",
      icon: GraduationCap,
      color: "violet",
      run: () => setTab("academy"),
    },
    {
      label: "Computer Help",
      icon: Laptop,
      color: "sky",
      run: () =>
        push("chat", {
          seed: "My computer is running slow — give me a safe step-by-step checklist to fix it.",
        }),
    },
    {
      label: "Analyze Link",
      icon: Link2,
      color: "emerald",
      run: () => openTool("link-analyzer"),
    },
  ];

  return (
    <div className="px-5 pt-6 pb-8">
      {/* greeting */}
      <h1 className="font-display text-[28px] font-bold leading-tight tracking-tight">
        How can I help
        <br />
        you <span className="text-neon text-glow">today</span>?
      </h1>
      <p className="mt-1.5 text-[13px] text-muted-foreground">
        Ask me anything about security, devices or code.
      </p>

      {/* quick actions */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {quickActions.map((a) => {
          const c = COLOR_MAP[a.color];
          return (
            <button
              key={a.label}
              type="button"
              onClick={a.run}
              className="group relative rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 text-left transition-all hover:border-neon/40 hover:bg-neon/[0.03] active:scale-[0.99]"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl border ${c.border} ${c.bg} ${c.text} ${c.glowShadow}`}
              >
                <a.icon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-[14px] font-semibold">{a.label}</p>
              <ChevronRight className="absolute bottom-4 right-4 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </button>
          );
        })}
      </div>

      {/* recent chats */}
      {recent === null ? (
        <section className="mt-7" aria-label="Recent chats">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neon/80">
            Recent chats
          </h2>
          <div className="mt-3 flex gap-2 overflow-hidden">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-9 w-32 shrink-0 animate-pulse rounded-full border border-white/[0.06] bg-white/[0.03]"
              />
            ))}
          </div>
        </section>
      ) : recent.length > 0 ? (
        <section className="mt-7" aria-label="Recent chats">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neon/80">
            Recent chats
          </h2>
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
            {recent.map((s) => (
              <button
                key={s.id}
                type="button"
                title={s.title}
                onClick={() => openChat({ sessionId: s.id, agent: s.agent })}
                className="shrink-0 max-w-[220px] truncate rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[13px] transition hover:border-neon/40"
              >
                {s.title}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {/* suggestions */}
      <section className="mt-7" aria-label="Suggestions">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neon/80">
          Try asking
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {GENERAL_AGENT.suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => push("chat", { seed: s })}
              className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[13px] transition hover:border-neon/40 hover:text-neon"
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      <p className="mt-10 text-center text-[11px] text-muted-foreground/70">
        AI responses may contain errors — verify critical information.
      </p>
    </div>
  );
}
