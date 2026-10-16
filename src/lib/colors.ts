import {
  Link2,
  Database,
  KeyRound,
  ShieldAlert,
  Code2,
  Wifi,
  FileText,
  Languages,
  type LucideIcon,
} from "lucide-react";
import type { AccentKey, ColorTokens, Severity, ToolDef } from "@/lib/types";

/**
 * Static Tailwind class maps for accent colors.
 * Dynamic class names must be avoided so Tailwind can compile them.
 */
export const COLOR_MAP: Record<AccentKey, ColorTokens> = {
  neon: {
    text: "text-neon",
    bg: "bg-neon/10",
    border: "border-neon/30",
    glowShadow: "shadow-[0_0_22px_-6px_var(--neon)]",
    solid: "bg-neon",
  },
  violet: {
    text: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    glowShadow: "shadow-[0_0_22px_-6px_rgba(167,139,250,0.75)]",
    solid: "bg-violet-500",
  },
  sky: {
    text: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
    glowShadow: "shadow-[0_0_22px_-6px_rgba(56,189,248,0.75)]",
    solid: "bg-sky-500",
  },
  emerald: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    glowShadow: "shadow-[0_0_22px_-6px_rgba(52,211,153,0.75)]",
    solid: "bg-emerald-500",
  },
  amber: {
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    glowShadow: "shadow-[0_0_22px_-6px_rgba(251,191,36,0.75)]",
    solid: "bg-amber-500",
  },
  rose: {
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    glowShadow: "shadow-[0_0_22px_-6px_rgba(251,113,133,0.75)]",
    solid: "bg-rose-500",
  },
};

export const SEVERITY_MAP: Record<Severity, { label: string; className: string; dot: string }> = {
  info: {
    label: "Info",
    className: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    dot: "bg-sky-400",
  },
  low: {
    label: "Low",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  medium: {
    label: "Medium",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    dot: "bg-amber-400",
  },
  high: {
    label: "High",
    className: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    dot: "bg-orange-400",
  },
  critical: {
    label: "Critical",
    className: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    dot: "bg-rose-400",
  },
};

/** Tool definitions for the Tools grid */
export const TOOLS: ToolDef[] = [
  {
    id: "link-analyzer",
    name: "Link & File Analyzer",
    short: "Scan links and files for threats.",
    description:
      "Paste a URL or upload a text file — Ai BLINE checks it for phishing patterns, suspicious structures and malicious indicators.",
    icon: Link2,
    color: "neon",
  },
  {
    id: "data-leak",
    name: "Data Leak Check",
    short: "Find if your data is exposed.",
    description:
      "Check whether an email appears in known breach datasets (simulated demo) and learn how to respond to leaks.",
    icon: Database,
    color: "sky",
    simulated: true,
  },
  {
    id: "password",
    name: "Strong Password",
    short: "Generate secure passwords.",
    description:
      "Create cryptographically secure passwords with adjustable length, symbols and entropy feedback.",
    icon: KeyRound,
    color: "violet",
  },
  {
    id: "vuln-guide",
    name: "Vulnerability Guide",
    short: "Learn about common vulnerabilities.",
    description:
      "Get clear explanations of common vulnerabilities — how they work and how to defend against them.",
    icon: ShieldAlert,
    color: "emerald",
  },
  {
    id: "code-helper",
    name: "Code Helper",
    short: "Debug and improve your code.",
    description:
      "Paste code and get issues, security notes and an improved version with explanations.",
    icon: Code2,
    color: "violet",
  },
  {
    id: "network-scanner",
    name: "Network Scanner",
    short: "Scan your network for devices.",
    description:
      "Explore how network discovery works with a simulated lab scan of your local range — educational demo.",
    icon: Wifi,
    color: "neon",
    simulated: true,
  },
  {
    id: "log-analyzer",
    name: "Log Analyzer",
    short: "Analyze logs and find issues.",
    description:
      "Paste application or system logs — get error counts, severity, root causes and suggested fixes.",
    icon: FileText,
    color: "amber",
  },
  {
    id: "translator",
    name: "Smart Translator",
    short: "Translate technical content.",
    description:
      "Translate text across security, programming and general domains while preserving technical terms.",
    icon: Languages,
    color: "sky",
  },
];
