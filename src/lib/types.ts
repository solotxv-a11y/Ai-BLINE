import type { LucideIcon } from "lucide-react";

/* ============================ Chat ============================ */

export interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

export interface HistorySession {
  id: string;
  title: string;
  agent: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

/* ============================ Saved ============================ */

export interface SavedItem {
  id: string;
  kind: string; // "message" | "tool" | "lesson"
  title: string;
  content: string;
  createdAt: string;
}

/* ============================ Academy ============================ */

export interface QuizQuestion {
  question: string;
  options: string[];
  /** index of the correct option */
  answer: number;
}

export interface Lesson {
  id: string;
  title: string;
  minutes: number;
  summary: string;
  /** markdown content */
  content: string;
  keyPoints: string[];
  quiz: QuizQuestion[];
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: AccentKey;
  level: "Beginner" | "Intermediate" | "Advanced";
  lessons: Lesson[];
}

export interface LessonProgressEntry {
  pathId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: string | null;
}

/* ============================ Tools ============================ */

export type Severity = "info" | "low" | "medium" | "high" | "critical";

export interface Finding {
  level: Severity;
  title: string;
  detail: string;
}

export interface LinkAnalysisResult {
  verdict: "safe" | "suspicious" | "dangerous";
  score: number; // 0-100 safety score
  findings: Finding[];
  summary: string;
}

export interface LeakBreach {
  name: string;
  date: string;
  dataTypes: string[];
  severity: "low" | "medium" | "high";
}

export interface LeakResult {
  simulated: true;
  email: string;
  found: boolean;
  breaches: LeakBreach[];
  tips: string[];
}

export interface LogAnalysisResult {
  counts: { error: number; warning: number; info: number };
  severity: "low" | "medium" | "high" | "critical";
  findings: Finding[];
  summary: string;
  fixes: string[];
}

export interface VulnResult {
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  howItWorks: string;
  example: string;
  prevention: string[];
}

export interface CodeIssue {
  title: string;
  detail: string;
  severity: "low" | "medium" | "high";
}

export interface CodeReviewResult {
  issues: CodeIssue[];
  improvedCode: string;
  explanation: string;
}

export interface ScannedHost {
  ip: string;
  hostname: string;
  mac: string;
  vendor: string;
  os: string;
  openPorts: { port: number; service: string; state: string }[];
  risk: "low" | "medium" | "high";
}

export interface ScanResult {
  simulated: true;
  target: string;
  hosts: ScannedHost[];
  summary: string;
}

export interface TranslateResult {
  translation: string;
  notes: string[];
}

/* ============================ UI ============================ */

export type AccentKey = "neon" | "violet" | "sky" | "emerald" | "amber" | "rose";

export interface ColorTokens {
  text: string;
  bg: string;
  border: string;
  glowShadow: string;
  solid: string;
}

export interface ToolDef {
  id: string;
  name: string;
  short: string; // one-line description for the grid card
  description: string;
  icon: LucideIcon;
  color: AccentKey;
  simulated?: boolean; // shows "SIMULATED" badge
}

export interface FindingStyle {
  label: string;
  className: string;
  dot: string;
}
