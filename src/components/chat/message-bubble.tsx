"use client";

import { memo, useCallback, useState } from "react";
import { Check, Copy, RefreshCw, Share2, Bookmark } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ChatMsg } from "@/lib/types";
import { postJSON } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Markdown } from "./markdown";

interface MessageBubbleProps {
  msg: ChatMsg;
  agentIcon: LucideIcon;
  isLastAssistant: boolean;
  busy: boolean;
  onRegenerate: () => void;
}

const ACTION_BTN =
  "flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground/70 transition hover:bg-white/5 hover:text-neon disabled:opacity-40";

/** One chat row — user bubble on the right, assistant markdown + action row on the left. */
export const MessageBubble = memo(function MessageBubble({
  msg,
  agentIcon: AgentIcon,
  isLastAssistant,
  busy,
  onRegenerate,
}: MessageBubbleProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
      toast({ title: "Copied to clipboard" });
    } catch {
      toast({ title: "Couldn't copy", variant: "destructive" });
    }
  }, [msg.content, toast]);

  const save = useCallback(async () => {
    try {
      await postJSON("/api/saved", {
        kind: "message",
        title: msg.content.trim().slice(0, 48),
        content: msg.content,
      });
      toast({ title: "Saved to your library" });
    } catch {
      toast({ title: "Couldn't save — please try again", variant: "destructive" });
    }
  }, [msg.content, toast]);

  const share = useCallback(async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "Ai BLINE", text: msg.content });
        return;
      }
      await navigator.clipboard.writeText(msg.content);
      toast({ title: "Copied to clipboard" });
    } catch {
      /* user cancelled the share sheet */
    }
  }, [msg.content, toast]);

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[82%] rounded-2xl rounded-br-md border border-neon/25 bg-neon/10 px-3.5 py-2.5 text-[14px] leading-relaxed">
          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mr-auto flex items-start gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-neon/30 bg-neon/10">
        <AgentIcon className="h-3.5 w-3.5 text-neon" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-white/[0.08] bg-white/[0.04] px-3.5 py-3">
          <Markdown content={msg.content} />
        </div>
        <div className="mt-1.5 flex items-center gap-0.5">
          <button
            type="button"
            onClick={copy}
            aria-label="Copy message"
            className={ACTION_BTN}
            disabled={busy}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-neon" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={save}
            aria-label="Save to library"
            className={ACTION_BTN}
            disabled={busy}
          >
            <Bookmark className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={share}
            aria-label="Share message"
            className={ACTION_BTN}
            disabled={busy}
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>
          {isLastAssistant && (
            <button
              type="button"
              onClick={onRegenerate}
              aria-label="Regenerate reply"
              className={ACTION_BTN}
              disabled={busy}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
