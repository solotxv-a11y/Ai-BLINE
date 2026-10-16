import type { CSSProperties } from "react";

interface LogoMarkProps {
  size?: number;
  className?: string;
  glow?: boolean;
  style?: CSSProperties;
}

/**
 * Ai BLINE logo — a lightning bolt formed by speed lines.
 * Color follows the current --neon accent automatically.
 */
export function LogoMark({ size = 28, className, glow = false, style }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        ...(glow ? { filter: "drop-shadow(0 0 6px var(--neon))" } : null),
        ...style,
      }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="aibline-g" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--neon)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--neon)" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      {/* speed lines */}
      <path d="M5 11.5h17.5" stroke="url(#aibline-g)" strokeWidth="3.6" strokeLinecap="round" />
      <path d="M9 21h11" stroke="url(#aibline-g)" strokeWidth="3.6" strokeLinecap="round" opacity="0.72" />
      <path d="M5 30.5h13.5" stroke="url(#aibline-g)" strokeWidth="3.6" strokeLinecap="round" opacity="0.45" />
      {/* bolt */}
      <path
        d="M36.5 4 24.8 24.6h7.4L26.4 44l13.9-23.2h-7.6L38.4 4h-1.9Z"
        fill="url(#aibline-g)"
      />
    </svg>
  );
}

export function LogoText({ size = 28 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2">
      <LogoMark size={size} glow />
      <span
        className="font-display font-bold tracking-tight text-foreground"
        style={{ fontSize: size * 0.62 }}
      >
        Ai <span className="text-neon text-glow">BLINE</span>
      </span>
    </span>
  );
}
