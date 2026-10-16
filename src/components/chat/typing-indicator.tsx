"use client";

import type { LucideIcon } from "lucide-react";

interface TypingIndicatorProps {
  icon: LucideIcon;
}

/** Three bouncing neon dots shown while the assistant is thinking. */
export function TypingIndicator({ icon: Icon }: TypingIndicatorProps) {
  return (
    <div className="mr-auto flex items-start gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-neon/30 bg-neon/10">
        <Icon className="h-3.5 w-3.5 text-neon" />
      </div>
      <div
        className="rounded-2xl rounded-bl-md border border-white/[0.08] bg-white/[0.04] px-4 py-3.5"
        role="status"
        aria-label="Assistant is typing"
      >
        <div className="flex items-center gap-1.5">
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-neon/80" style={{ animationDelay: "0s" }} />
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-neon/80" style={{ animationDelay: "0.15s" }} />
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-neon/80" style={{ animationDelay: "0.3s" }} />
        </div>
      </div>
    </div>
  );
}
