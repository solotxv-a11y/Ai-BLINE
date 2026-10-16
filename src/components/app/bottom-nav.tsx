"use client";

import { motion } from "framer-motion";
import { Home, Bot, GraduationCap, Wrench, User } from "lucide-react";
import { useAppStore, type Tab } from "@/lib/store";
import { cn } from "@/lib/utils";

const ITEMS: { tab: Tab; label: string; icon: typeof Home }[] = [
  { tab: "home", label: "Home", icon: Home },
  { tab: "agents", label: "Agents", icon: Bot },
  { tab: "academy", label: "Academy", icon: GraduationCap },
  { tab: "tools", label: "Tools", icon: Wrench },
  { tab: "account", label: "Account", icon: User },
];

export function BottomNav() {
  const { tab, setTab } = useAppStore();

  return (
    <nav
      className="relative z-40 shrink-0 border-t border-white/[0.06] bg-black/70 pb-safe backdrop-blur-xl"
      aria-label="Bottom navigation"
    >
      <div className="flex items-stretch justify-around px-2 pt-1.5 pb-1.5">
        {ITEMS.map(({ tab: key, label, icon: Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className="relative flex min-w-[52px] flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-neon/60"
            >
              <Icon
                className={cn(
                  "h-[21px] w-[21px] transition-all",
                  active ? "text-neon icon-glow" : "text-muted-foreground",
                )}
                strokeWidth={active ? 2.2 : 1.8}
              />
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  active ? "text-neon" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
              {active && (
                <motion.span
                  layoutId="navline"
                  className="absolute -bottom-0.5 h-[2.5px] w-7 rounded-full bg-neon shadow-[0_0_10px_var(--neon)]"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
