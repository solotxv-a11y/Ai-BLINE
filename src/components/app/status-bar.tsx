"use client";

import { Signal, Wifi, BatteryFull } from "lucide-react";

/** Fake phone status bar — only visible inside the desktop phone frame */
export function StatusBar() {
  return (
    <div className="hidden xl:flex items-center justify-between px-7 pt-3.5 pb-1 text-foreground/90 select-none">
      <span className="text-[13px] font-semibold font-display tracking-wide">9:41</span>
      <div className="flex items-center gap-1.5 text-foreground/90">
        <Signal className="h-3.5 w-3.5" strokeWidth={2.4} />
        <Wifi className="h-3.5 w-3.5" strokeWidth={2.4} />
        <BatteryFull className="h-4 w-4" strokeWidth={2} />
      </div>
    </div>
  );
}
