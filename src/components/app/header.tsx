"use client";

import { useState } from "react";
import { ArrowLeft, Bell, Menu, Github } from "lucide-react";
import { useAppStore, type Tab } from "@/lib/store";
import { LogoMark } from "@/components/app/logo";
import { getAgent } from "@/lib/agents";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const NAV_ITEMS: { tab: Tab; label: string }[] = [
  { tab: "home", label: "Home" },
  { tab: "agents", label: "AI Agents" },
  { tab: "academy", label: "Pentest Academy" },
  { tab: "tools", label: "Tools" },
  { tab: "account", label: "Account" },
];

export function AppHeader() {
  const { tab, stacks, back, setTab, resetToRoot } = useAppStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);

  const stack = stacks[tab];
  const view = stack[stack.length - 1];
  const canGoBack = stack.length > 1;
  const isChatWithAgent = view.name === "chat" && typeof view.params?.agent === "string" && view.params.agent !== "general";
  const agent = isChatWithAgent ? getAgent(view.params?.agent as string) : null;
  const customName = typeof view.params?.customAgentName === "string" ? (view.params.customAgentName as string) : null;

  const title = agent ? agent.name : customName ? customName : null;

  return (
    <header className="relative z-40 flex h-14 shrink-0 items-center justify-between border-b border-white/[0.06] bg-background/80 px-3 backdrop-blur-xl">
      {/* left slot */}
      <div className="flex w-20 items-center">
        {canGoBack ? (
          <button
            onClick={back}
            aria-label="Go back"
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-white/5 hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Open menu"
                className="flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-white/5 hover:text-foreground"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] border-white/10 bg-[#07090f] p-0">
              <SheetHeader className="border-b border-white/[0.06] px-5 pb-4 pt-6 text-left">
                <SheetTitle asChild>
                  <div className="flex items-center gap-2.5">
                    <LogoMark size={30} glow />
                    <span className="font-display text-lg font-bold">
                      Ai <span className="text-neon">BLINE</span>
                    </span>
                  </div>
                </SheetTitle>
                <p className="text-xs text-muted-foreground">AI security &amp; learning assistant</p>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-3" aria-label="Main navigation">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.tab}
                    onClick={() => {
                      resetToRoot(item.tab);
                      setDrawerOpen(false);
                    }}
                    className={`rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                      tab === item.tab
                        ? "bg-neon/10 text-neon"
                        : "text-foreground/70 hover:bg-white/5 hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
              <Separator className="bg-white/[0.06]" />
              <div className="p-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-white/10 bg-transparent hover:border-neon/40 hover:text-neon"
                  asChild
                >
                  <a href="https://github.com/your-username/ai-bline" target="_blank" rel="noreferrer">
                    <Github className="mr-2 h-4 w-4" /> View on GitHub
                  </a>
                </Button>
                <p className="mt-3 text-center text-[11px] text-muted-foreground">Ai BLINE • v1.0.0</p>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* center title */}
      <div className="flex flex-1 items-center justify-center">
        {title ? (
          <div className="flex items-center gap-2">
            {agent ? <agent.icon className="h-4.5 w-4.5 text-neon icon-glow" /> : null}
            <span className="font-display text-base font-semibold">{title}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2" onClick={() => resetToRoot()} role="button" tabIndex={0}>
            <LogoMark size={26} glow />
            <span className="font-display text-lg font-bold tracking-tight">
              Ai <span className="text-neon">BLINE</span>
            </span>
          </div>
        )}
      </div>

      {/* right slot */}
      <div className="flex w-20 items-center justify-end">
        <Sheet open={bellOpen} onOpenChange={setBellOpen}>
          <SheetTrigger asChild>
            <button
              aria-label="Notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-white/5 hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-neon shadow-[0_0_8px_var(--neon)]" />
            </button>
          </SheetTrigger>
          <SheetContent side="top" className="rounded-b-3xl border-white/10 bg-[#07090f]">
            <SheetHeader>
              <SheetTitle className="font-display">Notifications</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-2 pb-6">
              {[
                { title: "Welcome to Ai BLINE ⚡", body: "Your AI security assistant is ready. Try asking a question!", time: "now" },
                { title: "Academy reminder", body: "Continue Network Basics — you're 1 lesson from your next milestone.", time: "2h" },
                { title: "Weekly security tip", body: "Enable 2FA on your email first — it unlocks recovery for everything else.", time: "1d" },
              ].map((n, i) => (
                <div key={i} className="glass rounded-2xl p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{n.title}</p>
                    <span className="text-[11px] text-muted-foreground">{n.time}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{n.body}</p>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
