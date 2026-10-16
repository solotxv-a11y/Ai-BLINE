"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shared header pattern for account sub-views (back handled by the shell). */
export function ViewHeader({ title, subtitle, right }: { title: string; subtitle: string; right?: ReactNode }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="font-display text-[22px] font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">{subtitle}</p>
      </div>
      {right ? <div className="flex shrink-0 items-center pt-1">{right}</div> : null}
    </div>
  );
}

/** Small section label ("ACCENT COLOR", "DANGER ZONE", …). */
export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("px-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80", className)}>
      {children}
    </p>
  );
}

/** Rounded icon tile used in history/saved rows. */
export function IconTile({
  icon: Icon,
  tileClasses,
  iconClasses,
}: {
  icon: LucideIcon;
  tileClasses: string;
  iconClasses: string;
}) {
  return (
    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${tileClasses}`}>
      <Icon className={`h-5 w-5 ${iconClasses}`} />
    </div>
  );
}

/** Centered empty state. */
export function EmptyState({ icon: Icon, title, hint }: { icon: LucideIcon; title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] px-6 py-12 text-center">
      <Icon className="h-10 w-10 text-muted-foreground/50" />
      <p className="mt-3 text-[13px] text-muted-foreground">{title}</p>
      <p className="mt-1 text-[11.5px] text-muted-foreground/60">{hint}</p>
    </div>
  );
}
