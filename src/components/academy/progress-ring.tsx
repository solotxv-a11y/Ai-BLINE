"use client";

import { cn } from "@/lib/utils";

interface ProgressRingProps {
  percent: number;
  size?: number;
}

/**
 * Neon progress ring — SVG track + accent arc with glow,
 * centered percentage label in the display font.
 */
export function ProgressRing({ percent, size = 62 }: ProgressRingProps) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const offset = circumference * (1 - clamped / 100);
  const fontSize = Math.round(size * 0.27);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${clamped}% complete`}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--neon)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
            filter: "drop-shadow(0 0 5px var(--neon))",
          }}
        />
      </svg>
      <span
        aria-hidden="true"
        className={cn("absolute inset-0 flex items-center justify-center font-display font-bold text-foreground")}
        style={{ fontSize }}
      >
        {clamped}%
      </span>
    </div>
  );
}

export default ProgressRing;
