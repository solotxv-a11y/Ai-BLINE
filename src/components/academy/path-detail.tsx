"use client";

import { Check, ChevronRight } from "lucide-react";
import { LEARNING_PATHS } from "@/lib/academy-data";
import { COLOR_MAP } from "@/lib/colors";
import { useAppStore } from "@/lib/store";
import type { LessonProgressEntry } from "@/lib/types";

interface PathDetailProps {
  pathId: string;
  progress: LessonProgressEntry[];
  /** not required — the shell header back button handles navigation */
  onBack?: () => void;
}

export function PathDetail({ pathId, progress, onBack: _onBack }: PathDetailProps) {
  const push = useAppStore((s) => s.push);
  const path = LEARNING_PATHS.find((p) => p.id === pathId);

  if (!path) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center px-5">
        <p className="text-sm text-muted-foreground">Path not found — go back and pick another one.</p>
      </div>
    );
  }

  const c = COLOR_MAP[path.color];
  const Icon = path.icon;
  const completedIds = new Set(
    progress.filter((p) => p.pathId === path.id && p.completed).map((p) => p.lessonId),
  );
  const done = path.lessons.filter((l) => completedIds.has(l.id)).length;
  const total = path.lessons.length;
  const percent = Math.round((done / total) * 100);
  const totalMinutes = path.lessons.reduce((n, l) => n + l.minutes, 0);

  return (
    <div className="px-5 pt-5 pb-8">
      {/* header */}
      <div className="flex items-center gap-3.5">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${c.border} ${c.bg} ${c.text} ${c.glowShadow}`}
        >
          <Icon className="h-5.5 w-5.5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-[20px] font-bold leading-tight">{path.title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[10.5px] text-muted-foreground">
              {path.level}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {total} lessons • ~{totalMinutes} min
            </span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{path.description}</p>

      {/* overall progress */}
      <div className="mt-4">
        <div className="h-1.5 w-full rounded-full bg-white/[0.08]">
          <div
            className="h-full rounded-full bg-neon shadow-[0_0_8px_var(--neon)] transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-1.5 text-[12px] text-neon">
          {percent}% complete{done > 0 ? ` — ${done}/${total} lessons` : ""}
        </p>
      </div>

      {/* lessons */}
      <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-neon/80">Lessons</p>
      <div className="mt-3 flex flex-col gap-2.5">
        {path.lessons.map((lesson, idx) => {
          const isDone = completedIds.has(lesson.id);
          return (
            <button
              key={lesson.id}
              type="button"
              onClick={() => push("lesson", { pathId: path.id, lessonId: lesson.id })}
              className="w-full rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3.5 text-left transition-all hover:border-neon/40 active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                {isDone ? (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neon text-black shadow-[0_0_12px_-2px_var(--neon)]">
                    <Check className="h-4 w-4" aria-hidden="true" />
                  </span>
                ) : (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-[13px] font-semibold text-muted-foreground">
                    {idx + 1}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14.5px] font-medium">{lesson.title}</p>
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">{lesson.minutes} min read</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PathDetail;
