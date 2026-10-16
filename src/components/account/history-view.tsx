"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bot, MessageSquareOff, MoreVertical, Trash2 } from "lucide-react";
import { getJSON, postJSON, deleteJSON } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { getAgent, AGENTS } from "@/lib/agents";
import { COLOR_MAP } from "@/lib/colors";
import type { HistorySession } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { EmptyState, ViewHeader } from "./parts";

const KNOWN_AGENTS = new Set<string>(["general", ...AGENTS.map((a) => a.key)]);

export default function HistoryView() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<HistorySession[] | null>(null);
  const [pendingDelete, setPendingDelete] = useState<HistorySession | null>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getJSON<{ sessions: HistorySession[] }>("/api/history");
      setSessions(data.sessions);
    } catch (err) {
      setSessions([]);
      toast({ title: "Couldn't load history", description: err instanceof Error ? err.message : "Unknown error" });
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  async function removeSession(id: string) {
    try {
      await deleteJSON(`/api/history/${id}`);
      setSessions((prev) => (prev ? prev.filter((s) => s.id !== id) : prev));
      toast({ title: "Conversation deleted" });
    } catch (err) {
      toast({ title: "Delete failed", description: err instanceof Error ? err.message : "Unknown error" });
    }
  }

  async function clearAll() {
    setClearing(true);
    try {
      await postJSON("/api/history/clear", {});
      setSessions([]);
      toast({ title: "All conversations cleared" });
    } catch (err) {
      toast({ title: "Clear failed", description: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setClearing(false);
    }
  }

  const list = sessions ?? [];
  const loading = sessions === null;

  return (
    <div className="px-5 pt-5 pb-8">
      <ViewHeader
        title="Chat History"
        subtitle="All your conversations"
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
                <AlertDialogTitle>Clear all conversations?</AlertDialogTitle>
                <AlertDialogDescription>
                  Every chat will be permanently deleted. This can&apos;t be undone.
                </AlertDialogDescription>
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
            <Skeleton key={i} className="h-[68px] rounded-2xl bg-white/[0.04]" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState icon={MessageSquareOff} title="No conversations yet" hint="Start chatting from Home" />
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((session) => {
            const known = KNOWN_AGENTS.has(session.agent);
            const def = getAgent(session.agent);
            const Icon = known ? def.icon : Bot;
            const tokens = known ? COLOR_MAP[def.color] : COLOR_MAP.neon;
            return (
              <div
                key={session.id}
                role="button"
                tabIndex={0}
                onClick={() => useAppStore.getState().openChat({ sessionId: session.id, agent: session.agent })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    useAppStore.getState().openChat({ sessionId: session.id, agent: session.agent });
                  }
                }}
                className="flex cursor-pointer items-center gap-3.5 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3.5 transition-all hover:bg-white/[0.05] active:scale-[0.99]"
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${tokens.bg} ${tokens.border}`}>
                  <Icon className={`h-5 w-5 ${tokens.text}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium line-clamp-1">{session.title}</p>
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                    {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })} • {session.messageCount}{" "}
                    {session.messageCount === 1 ? "message" : "messages"}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label="Conversation options"
                      onClick={(e) => e.stopPropagation()}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="border-white/10 bg-[#0b1019]">
                    <DropdownMenuItem
                      className="gap-2 text-rose-400 focus:text-rose-400"
                      onSelect={() => {
                        // let the dropdown close before opening the confirm dialog
                        setTimeout(() => setPendingDelete(session), 30);
                      }}
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      )}

      {/* delete confirmation */}
      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent className="border-white/10 bg-[#0b1019]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.title ? `“${pendingDelete.title}” will be permanently removed.` : "This chat will be permanently removed."}{" "}
              This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-500/90 text-white hover:bg-rose-500"
              onClick={() => {
                const id = pendingDelete?.id;
                setPendingDelete(null);
                if (id) void removeSession(id);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
