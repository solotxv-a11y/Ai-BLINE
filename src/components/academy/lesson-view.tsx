"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Check, CheckCircle2, ChevronRight, Zap } from "lucide-react";
import { LEARNING_PATHS } from "@/lib/academy-data";
import { postJSON } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import type { LessonProgressEntry, LearningPath, Lesson, QuizQuestion } from "@/lib/types";

interface LessonViewProps {
  pathId: string;
  lessonId: string;
  progress: LessonProgressEntry[];
  onComplete: (pathId: string, lessonId: string) => void;
}

/* ------------------------- markdown rendering ------------------------- */

const mdComponents = {
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="mt-4 mb-1.5 text-[15px] font-semibold text-foreground">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="mt-3 mb-1 text-[14px] font-semibold text-foreground">{children}</h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="my-2 text-[13.5px] leading-relaxed text-foreground/85">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="my-2 space-y-1.5">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="my-2 list-decimal space-y-1.5 pl-4 text-[13.5px] leading-relaxed text-foreground/85">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="flex items-start gap-2 text-[13.5px] leading-relaxed text-foreground/85">
      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-neon/70" aria-hidden="true" />
      <span>{children}</span>
    </li>
  ),
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="rounded bg-white/[0.08] px-1 py-0.5 font-mono text-[12px] text-neon">{children}</code>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="my-2 border-l-2 border-neon/40 pl-3 text-[13px] text-muted-foreground">{children}</blockquote>
  ),
  a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
    <a href={href} className="text-neon underline underline-offset-2">
      {children}
    </a>
  ),
};

/* ------------------------------ quiz card ----------------------------- */

function QuizSection({
  path,
  lesson,
  alreadyCompleted,
  onComplete,
}: {
  path: LearningPath;
  lesson: Lesson;
  alreadyCompleted: boolean;
  onComplete: (pathId: string, lessonId: string) => void;
}) {
  const { toast } = useToast();
  const replace = useAppStore((s) => s.replace);

  const [answers, setAnswers] = useState<(number | null)[]>(() => lesson.quiz.map(() => null));
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const completed = alreadyCompleted || submitted;
  const allAnswered = answers.every((a) => a !== null);
  const nextLesson = useMemo(() => {
    const idx = path.lessons.findIndex((l) => l.id === lesson.id);
    return idx >= 0 && idx < path.lessons.length - 1 ? path.lessons[idx + 1] : null;
  }, [path, lesson.id]);

  const choose = (qIdx: number, optIdx: number) => {
    if (answers[qIdx] !== null) return;
    setAnswers((prev) => prev.map((a, i) => (i === qIdx ? optIdx : a)));
  };

  const submit = async () => {
    if (!allAnswered || submitting || submitted || alreadyCompleted) return;
    setSubmitting(true);
    try {
      await postJSON("/api/academy", { pathId: path.id, lessonId: lesson.id, completed: true });
      toast({ title: "Lesson complete! 🎉" });
      setSubmitted(true);
      onComplete(path.id, lesson.id);
    } catch {
      toast({ title: "Could not save progress", description: "Check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const optionClass = (q: QuizQuestion, qIdx: number, optIdx: number) => {
    const selected = answers[qIdx] === optIdx;
    const answered = answers[qIdx] !== null;
    if (answered && optIdx === q.answer) {
      return "border-emerald-500/50 bg-emerald-500/10 text-emerald-300";
    }
    if (selected && optIdx !== q.answer) {
      return "border-rose-500/50 bg-rose-500/10 text-rose-300";
    }
    return "border-white/10 bg-white/[0.03] hover:border-neon/40 text-foreground/85";
  };

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neon/80">Knowledge Check</p>

      <div className="mt-3 flex flex-col gap-5">
        {lesson.quiz.map((q, qIdx) => {
          const answered = answers[qIdx] !== null;
          const isCorrect = answers[qIdx] === q.answer;
          return (
            <div key={qIdx}>
              <p className="text-[13.5px] font-medium">
                <span className="mr-1.5 text-neon">{qIdx + 1}.</span>
                {q.question}
              </p>
              <div className="mt-2.5 flex flex-col gap-2" role="group" aria-label={`Question ${qIdx + 1} options`}>
                {q.options.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    type="button"
                    disabled={answered}
                    onClick={() => choose(qIdx, optIdx)}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-left text-[13px] transition-all active:scale-[0.99] disabled:cursor-default ${optionClass(q, qIdx, optIdx)}`}
                  >
                    <span className="mr-2 font-semibold opacity-70">{String.fromCharCode(65 + optIdx)}.</span>
                    {opt}
                  </button>
                ))}
              </div>
              {answered && (
                <p className={`mt-2 text-[12px] ${isCorrect ? "text-emerald-400" : "text-rose-400"}`}>
                  {isCorrect ? "Correct!" : "Not quite — the highlighted answer is correct."}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* complete / completed actions */}
      {!completed ? (
        <button
          type="button"
          onClick={submit}
          disabled={!allAnswered || submitting}
          className="mt-5 h-11 w-full rounded-xl bg-neon text-[14px] font-semibold text-black shadow-[0_0_20px_-4px_var(--neon)] transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-40 disabled:shadow-none"
        >
          {submitting ? "Saving…" : allAnswered ? "Complete lesson" : "Answer both questions to complete"}
        </button>
      ) : (
        <button
          type="button"
          disabled
          className="mt-5 h-11 w-full rounded-xl border border-neon/40 bg-neon/10 text-[14px] font-semibold text-neon"
        >
          Completed ✓
        </button>
      )}

      {/* success panel */}
      {completed && (
        <div className="mt-4 rounded-2xl border border-neon/30 bg-neon/[0.05] p-4 text-center">
          <CheckCircle2 className="mx-auto h-7 w-7 text-neon icon-glow" aria-hidden="true" />
          <p className="mt-2 font-display text-[15px] font-bold">
            {nextLesson ? "Lesson completed" : "Path complete! 🎉"}
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            {nextLesson
              ? "Nice work — keep the streak going."
              : "You finished every lesson in this path. Outstanding!"}
          </p>
          {nextLesson ? (
            <button
              type="button"
              onClick={() => replace("lesson", { pathId: path.id, lessonId: nextLesson.id })}
              className="mt-3 inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-neon px-5 text-[13.5px] font-semibold text-black shadow-[0_0_20px_-4px_var(--neon)] transition-all hover:brightness-110 active:scale-[0.99]"
            >
              Next lesson
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => useAppStore.getState().resetToRoot("academy")}
              className="mt-3 inline-flex h-10 items-center justify-center rounded-xl bg-neon px-5 text-[13.5px] font-semibold text-black shadow-[0_0_20px_-4px_var(--neon)] transition-all hover:brightness-110 active:scale-[0.99]"
            >
              Back to paths
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ----------------------------- lesson view ---------------------------- */

export function LessonView({ pathId, lessonId, progress, onComplete }: LessonViewProps) {
  const path = LEARNING_PATHS.find((p) => p.id === pathId);
  const lesson = path?.lessons.find((l) => l.id === lessonId);

  if (!path || !lesson) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center px-5">
        <p className="text-sm text-muted-foreground">Lesson not found — go back and pick another one.</p>
      </div>
    );
  }

  const isCompleted = progress.some((p) => p.pathId === path.id && p.lessonId === lesson.id && p.completed);

  return (
    <div className="px-5 pt-5 pb-8">
      {/* header */}
      <h1 className="font-display text-[22px] font-bold leading-tight">{lesson.title}</h1>
      <div className="mt-2 flex items-center gap-1.5">
        <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[11px] text-muted-foreground">
          {lesson.minutes} min
        </span>
        {isCompleted && (
          <span className="inline-flex items-center gap-1 rounded-full border border-neon/40 bg-neon/10 px-2.5 py-0.5 text-[11px] font-semibold text-neon">
            <Check className="h-3 w-3" aria-hidden="true" />
            Completed
          </span>
        )}
      </div>

      <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">{lesson.summary}</p>

      {/* content */}
      <div className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
        <ReactMarkdown components={mdComponents}>{lesson.content}</ReactMarkdown>
      </div>

      {/* key points */}
      <div className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neon/80">Key Points</p>
        <ul className="mt-2.5 flex flex-col gap-2">
          {lesson.keyPoints.map((kp, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <Zap className="mt-1 h-3.5 w-3.5 shrink-0 text-neon" aria-hidden="true" />
              <span className="text-[13px] leading-snug text-foreground/85">{kp}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* quiz — keyed by lessonId so state resets on "Next lesson" */}
      <div className="mt-4">
        <QuizSection key={lesson.id} path={path} lesson={lesson} alreadyCompleted={isCompleted} onComplete={onComplete} />
      </div>
    </div>
  );
}

export default LessonView;
