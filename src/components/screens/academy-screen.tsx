"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ChevronRight, GraduationCap, Scale, Terminal } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { LEARNING_PATHS } from "@/lib/academy-data";
import { COLOR_MAP } from "@/lib/colors";
import { getJSON } from "@/lib/api";
import type { LessonProgressEntry, LearningPath } from "@/lib/types";
import { ProgressRing } from "@/components/academy/progress-ring";
import { PathDetail } from "@/components/academy/path-detail";
import { LessonView } from "@/components/academy/lesson-view";
import { LabTerminal } from "@/components/academy/lab-terminal";

type PathStats = { done: number; total: number; percent: number };

function statsFor(path: LearningPath, completedIds: Set<string>): PathStats {
  const done = path.lessons.filter((l) => completedIds.has(`${path.id}:${l.id}`)).length;
  const total = path.lessons.length;
  return { done, total, percent: Math.round((done / total) * 100) };
}

/* ------------------------------ overview ------------------------------ */

function Overview({
  progress,
  loading,
}: {
  progress: LessonProgressEntry[];
  loading: boolean;
}) {
  const push = useAppStore((s) => s.push);

  const completedIds = useMemo(
    () =>
      new Set(progress.filter((p) => p.completed).map((p) => `${p.pathId}:${p.lessonId}`)),
    [progress],
  );

  const stats = useMemo(
    () => LEARNING_PATHS.map((p) => ({ path: p, ...statsFor(p, completedIds) })),
    [completedIds],
  );

  /* first path in progress (0 < percent < 100), else first not finished, else first */
  const continuePath = useMemo(() => {
    const inProgress = stats.find((s) => s.percent > 0 && s.percent < 100);
    return inProgress ?? stats.find((s) => s.percent < 100) ?? stats[0];
  }, [stats]);

  return (
    <div className="px-5 pt-5 pb-8">
      {/* header */}
      <div className="flex items-center gap-2.5">
        <GraduationCap className="h-6 w-6 text-neon icon-glow" aria-hidden="true" />
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-tight">Pentest Academy</h1>
          <p className="text-[13px] font-semibold text-neon text-glow">Legal &amp; ethical training</p>
        </div>
      </div>

      {/* continue learning hero */}
      {continuePath && (
        <button
          type="button"
          onClick={() => push("path", { pathId: continuePath.path.id })}
          className="mt-5 block w-full rounded-2xl border border-neon/40 bg-neon/[0.05] p-4 text-left box-glow transition-all hover:border-neon/60 active:scale-[0.99]"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neon/80">
            Continue Learning
          </p>
          <div className="mt-2.5 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-[17px] font-bold">{continuePath.path.title}</p>
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                {continuePath.done}/{continuePath.total} lessons
              </p>
              <div className="mt-2.5 h-1.5 w-40 rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-neon shadow-[0_0_8px_var(--neon)] transition-all duration-500"
                  style={{ width: `${continuePath.percent}%` }}
                />
              </div>
            </div>
            <ProgressRing percent={continuePath.percent} size={62} />
            <ChevronRight className="h-5 w-5 shrink-0 text-neon/70" aria-hidden="true" />
          </div>
        </button>
      )}

      {/* learning paths */}
      <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-neon/80">
        Learning Paths
      </p>
      <div className="mt-3 flex flex-col gap-2.5">
        {stats.map(({ path, done, total, percent }) => {
          const c = COLOR_MAP[path.color];
          const Icon = path.icon;
          const isComplete = percent === 100;
          return (
            <button
              key={path.id}
              type="button"
              onClick={() => push("path", { pathId: path.id })}
              className="w-full rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 text-left transition-all hover:border-neon/40 active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${c.border} ${c.bg} ${c.text} ${c.glowShadow}`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[15px] font-semibold">{path.title}</span>
                    <span className="flex shrink-0 items-center gap-1">
                      {isComplete ? (
                        <Check className="h-4 w-4 text-neon" aria-label="Path complete" />
                      ) : (
                        <span className="text-[13px] font-semibold text-neon">{percent}%</span>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                    {path.level} • {done}/{total} lessons
                  </p>
                  <div className="mt-2 h-1 w-full rounded-full bg-white/[0.08]">
                    <div
                      className="h-full rounded-full bg-neon shadow-[0_0_8px_var(--neon)] transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* practice lab */}
      <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-neon/80">Practice</p>
      <button
        type="button"
        onClick={() => push("lab")}
        className="mt-3 flex w-full items-center gap-3.5 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 text-left transition-all hover:border-neon/40 active:scale-[0.99]"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neon/30 bg-neon/10 text-neon shadow-[0_0_22px_-6px_var(--neon)]">
          <Terminal className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold">Practice Lab</p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Try commands in a safe simulated terminal
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-neon/40 px-3 py-1 text-[11.5px] font-semibold text-neon">
          Open Lab
        </span>
      </button>

      {/* ethics disclaimer */}
      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-4">
        <Scale className="mt-0.5 h-4.5 w-4.5 shrink-0 text-amber-400" aria-hidden="true" />
        <p className="text-[12px] leading-relaxed text-amber-200/80">
          All academy content is for legal, authorized education only. Never test or scan systems you don&apos;t
          own or lack written permission to test.
        </p>
      </div>

      {loading && (
        <p className="mt-4 text-center text-[11px] text-muted-foreground">Syncing your progress…</p>
      )}
    </div>
  );
}

/* ------------------------------- screen ------------------------------- */

export default function AcademyScreen() {
  const stacks = useAppStore((s) => s.stacks);
  const tab = useAppStore((s) => s.tab);
  const stack = stacks[tab];
  const top = stack[stack.length - 1];

  const [progress, setProgress] = useState<LessonProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await getJSON<{ progress: LessonProgressEntry[] }>("/api/academy");
      setProgress(data.progress ?? []);
    } catch {
      /* offline-friendly: keep whatever we have */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (top.name === "lab") {
    return <LabTerminal />;
  }

  if (top.name === "path") {
    const pathId = typeof top.params?.pathId === "string" ? top.params.pathId : "";
    return <PathDetail pathId={pathId} progress={progress} />;
  }

  if (top.name === "lesson") {
    const pathId = typeof top.params?.pathId === "string" ? top.params.pathId : "";
    const lessonId = typeof top.params?.lessonId === "string" ? top.params.lessonId : "";
    return <LessonView pathId={pathId} lessonId={lessonId} progress={progress} onComplete={() => void refresh()} />;
  }

  return <Overview progress={progress} loading={loading} />;
}
