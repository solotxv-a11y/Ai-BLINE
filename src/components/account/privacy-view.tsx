"use client";

import { useState } from "react";
import { BarChart3, HardDrive, Trash2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { postJSON, deleteJSON } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
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
import { SectionLabel, ViewHeader } from "./parts";

export default function PrivacyView() {
  const { localOnlyHistory, setLocalOnlyHistory } = useAppStore();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  /** Runs the cleanup pipeline in order; endpoints owned by other tasks may not exist yet, so failures are non-fatal. */
  async function clearAllData() {
    setClearing(true);
    const steps: (() => Promise<unknown>)[] = [
      () => postJSON("/api/history/clear", {}),
      () => deleteJSON("/api/saved/clear"),
      () => postJSON("/api/academy/reset", {}),
      async () => {
        localStorage.removeItem("aibline-custom-agents");
      },
    ];
    for (const step of steps) {
      try {
        await step();
      } catch {
        /* continue — best-effort cleanup */
      }
    }
    setClearing(false);
    toast({ title: "All data cleared" });
  }

  return (
    <div className="px-5 pt-5 pb-8">
      <ViewHeader title="Privacy" subtitle="You stay in control" />

      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] divide-y divide-white/[0.06]">
        <div className="flex items-center gap-3.5 px-4 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-foreground/80">
            <HardDrive className="h-4.5 w-4.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14.5px] font-medium">Local-only history</span>
            <span className="mt-0.5 block text-[11.5px] text-muted-foreground">Chat history never leaves your device</span>
          </span>
          <Switch
            checked={localOnlyHistory}
            onCheckedChange={setLocalOnlyHistory}
            aria-label="Toggle local-only history"
          />
        </div>
        <div className="flex items-center gap-3.5 px-4 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-foreground/80">
            <BarChart3 className="h-4.5 w-4.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14.5px] font-medium">Usage analytics</span>
            <span className="mt-0.5 block text-[11.5px] text-muted-foreground">
              Share anonymous usage to improve the app (demo — stays off)
            </span>
          </span>
          <Switch checked={analytics} onCheckedChange={setAnalytics} aria-label="Toggle usage analytics" />
        </div>
      </div>

      {/* danger zone */}
      <SectionLabel className="mt-6 text-rose-400/80">Danger Zone</SectionLabel>
      <div className="mt-3 rounded-2xl border border-rose-500/25 bg-rose-500/[0.05] p-4">
        <div className="flex items-center gap-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400">
            <Trash2 className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-medium">Clear all data</p>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">Deletes chats, saved items and academy progress</p>
          </div>
        </div>
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={clearing}
            className="mt-3.5 h-9 w-full rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 text-[12.5px] font-semibold text-rose-300 transition-colors hover:bg-rose-500/20 disabled:opacity-40"
          >
            {clearing ? "Clearing…" : "Clear everything"}
          </button>
          <AlertDialogContent className="border-white/10 bg-[#0b1019]">
            <AlertDialogHeader>
              <AlertDialogTitle>Clear all data?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently deletes your chats, saved items and academy progress on this device. This can&apos;t be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-rose-500/90 text-white hover:bg-rose-500"
                onClick={() => void clearAllData()}
              >
                {clearing ? "Clearing…" : "Clear all data"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
