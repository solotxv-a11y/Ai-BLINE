"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bookmark, Copy, GraduationCap, MessageSquare, Trash2, Wrench, type LucideIcon } from "lucide-react";
import { getJSON, deleteJSON } from "@/lib/api";
import { COLOR_MAP } from "@/lib/colors";
import type { AccentKey, SavedItem } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, IconTile, ViewHeader } from "./parts";

const KIND_META: Record<string, { icon: LucideIcon; label: string; accent: AccentKey }> = {
  message: { icon: MessageSquare, label: "Message", accent: "neon" },
  tool: { icon: Wrench, label: "Tool", accent: "violet" },
  lesson: { icon: GraduationCap, label: "Lesson", accent: "emerald" },
};

function metaFor(kind: string) {
  return KIND_META[kind] ?? KIND_META.message;
}

function previewOf(content: string): string {
  const trimmed = content.trimStart();
  if (trimmed.startsWith("{")) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      return JSON.stringify(parsed, null, 2).slice(0, 200);
    } catch {
      /* not valid JSON — fall through to raw slice */
    }
  }
  return content.slice(0, 200);
}

export default function SavedView() {
  const { toast } = useToast();
  const [items, setItems] = useState<SavedItem[] | null>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getJSON<{ items: SavedItem[] }>("/api/saved");
      setItems(data.items);
    } catch (err) {
      setItems([]);
      toast({ title: "Couldn't load saved items", description: err instanceof Error ? err.message : "Unknown error" });
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  async function copyItem(item: SavedItem) {
    try {
      await navigator.clipboard.writeText(item.content);
      toast({ title: "Copied" });
    } catch {
      toast({ title: "Copy failed", description: "Clipboard is unavailable on this device." });
    }
  }

  async function removeItem(id: string) {
    try {
      await deleteJSON(`/api/saved/${id}`);
      setItems((prev) => (prev ? prev.filter((it) => it.id !== id) : prev));
      toast({ title: "Removed" });
    } catch (err) {
      toast({ title: "Delete failed", description: err instanceof Error ? err.message : "Unknown error" });
    }
  }

  async function clearAll() {
    setClearing(true);
    try {
      await deleteJSON("/api/saved/clear");
      setItems([]);
      toast({ title: "Saved items cleared" });
    } catch (err) {
      toast({ title: "Clear failed", description: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setClearing(false);
    }
  }

  const list = items ?? [];
  const loading = items === null;

  return (
    <div className="px-5 pt-5 pb-8">
      <ViewHeader
        title="Saved"
        subtitle="Your library of useful snippets"
        right={
          <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
            <button
              type="button"
              onClick={() => setClearOpen(true)}
              disabled={loading || list.length === 0}
              className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-rose-400 transition-colors hover:bg-rose-500/10 disabled:opacity-40"
            >
              Clear all
            </button>
            <AlertDialogContent className="border-white/10 bg-[#0b1019]">
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all saved items?</AlertDialogTitle>
                <AlertDialogDescription>Your whole library will be permanently deleted. This can&apos;t be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-rose-500/90 text-white hover:bg-rose-500"
                  onClick={() => void clearAll()}
                >
                  {clearing ? "Clearing…" : "Clear all"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        }
      />

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[92px] rounded-2xl bg-white/[0.04]" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Nothing saved yet"
          hint="Save AI answers and tool results to find them here"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((item) => {
            const meta = metaFor(item.kind);
            const tokens = COLOR_MAP[meta.accent];
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3.5 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <IconTile
                    icon={meta.icon}
                    tileClasses={`${tokens.bg} ${tokens.border}`}
                    iconClasses={tokens.text}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium line-clamp-1">{item.title}</p>
                    <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                      {meta.label} • {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Copy saved item"
                    onClick={() => void copyItem(item)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete saved item"
                    onClick={() => void removeItem(item.id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2.5 whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-muted-foreground line-clamp-2">
                  {previewOf(item.content)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
