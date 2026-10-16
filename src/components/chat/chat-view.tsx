"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { Bot, FileText, Mic, Paperclip, Send, X } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { GENERAL_AGENT, getAgent } from "@/lib/agents";
import { getJSON, postJSON } from "@/lib/api";
import type { ChatMsg } from "@/lib/types";
import { LogoMark } from "@/components/app/logo";
import { useToast } from "@/hooks/use-toast";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";

export interface ChatViewParams {
  sessionId?: string;
  agent?: string;
  seed?: string;
  customAgentName?: string;
  customPrompt?: string;
}

interface ChatSendResponse {
  sessionId: string;
  title: string;
  reply: string;
}

interface HistoryResponse {
  session: { id: string; title: string; agent: string; createdAt: string; updatedAt: string };
  messages: ChatMsg[];
}

const PLACEHOLDERS: Record<string, string> = {
  general: "Type your message...",
  "security-advisor": "Ask your security question...",
  "pentest-mentor": "Ask about labs, tools or methodology...",
  "computer-expert": "Describe your computer problem...",
  "code-assistant": "Paste code or describe the bug...",
  researcher: "What topic should I dig into?",
  custom: "Message your custom agent...",
};

const MAX_FILE_CHARS = 8000;

/**
 * Full-screen chat experience. Rendered by home-screen / agents-screen when the
 * current stack top is the "chat" view. Reads its params from the navigation store.
 */
export function ChatView() {
  const { toast } = useToast();
  const replace = useAppStore((s) => s.replace);

  // Current view = top of the active tab's stack
  const top = useAppStore((s) => {
    const st = s.stacks[s.tab];
    return st[st.length - 1];
  });
  const params = (top?.params ?? {}) as Partial<ChatViewParams>;

  const sessionId = typeof params.sessionId === "string" ? params.sessionId : undefined;
  const agentKey =
    typeof params.agent === "string" && params.agent ? params.agent : "general";
  const customPrompt = typeof params.customPrompt === "string" ? params.customPrompt : undefined;
  const customName =
    typeof params.customAgentName === "string" ? params.customAgentName : undefined;
  const seed = typeof params.seed === "string" ? params.seed : undefined;

  const agentDef = useMemo(() => getAgent(agentKey), [agentKey]);
  const isCustom = agentKey === "custom";
  const AgentIcon = isCustom ? Bot : agentDef.icon;

  const displayName = isCustom ? customName || "Custom Agent" : agentDef.name;
  const tagline = isCustom ? "Your custom agent — built by you" : agentDef.tagline;
  const suggestions = isCustom ? GENERAL_AGENT.suggestions : agentDef.suggestions;

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [booting, setBooting] = useState<boolean>(Boolean(sessionId));
  const [sending, setSending] = useState<boolean>(false);
  const [draft, setDraft] = useState<string>("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [lastFailed, setLastFailed] = useState<string | null>(null);

  const loadedSessionRef = useRef<string | null>(null);
  const seedSentRef = useRef<boolean>(false);
  const sendingRef = useRef<boolean>(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* ---------- load existing history (once per sessionId) ---------- */
  useEffect(() => {
    if (!sessionId) {
      setBooting(false);
      return;
    }
    if (loadedSessionRef.current === sessionId) return;
    loadedSessionRef.current = sessionId;

    let cancelled = false;
    (async () => {
      try {
        const data = await getJSON<HistoryResponse>(`/api/history/${sessionId}`);
        if (!cancelled) setMessages(data.messages);
      } catch {
        if (!cancelled)
          toast({ title: "Couldn't load this conversation", variant: "destructive" });
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId, toast]);

  /* ---------- auto-send the seed question once ---------- */
  useEffect(() => {
    if (booting || sendingRef.current) return;
    if (!seed || seedSentRef.current) return;
    if (messages.length > 0) return;
    seedSentRef.current = true;
    void send(seed);
  }, [booting, messages.length, seed, sending]);

  /* ---------- send ---------- */
  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sendingRef.current) return;
      sendingRef.current = true;
      setSending(true);
      setLastFailed(null);
      const optimisticId = `local-u-${Date.now()}`;
      setMessages((prev) => [...prev, { id: optimisticId, role: "user", content: trimmed }]);

      try {
        const data = await postJSON<ChatSendResponse>("/api/chat", {
          ...(sessionId ? { sessionId } : {}),
          agent: agentKey,
          message: trimmed,
          ...(customPrompt ? { customPrompt } : {}),
        });
        setMessages((prev) => [
          ...prev,
          { id: `local-a-${Date.now()}`, role: "assistant", content: data.reply },
        ]);
        // First successful send without a session → adopt the server session
        if (!sessionId && data.sessionId) {
          replace("chat", { ...params, sessionId: data.sessionId });
        }
      } catch (err) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        setLastFailed(trimmed);
        toast({
          title: "Message failed",
          description: err instanceof Error ? err.message : "Please try again.",
          variant: "destructive",
        });
      } finally {
        sendingRef.current = false;
        setSending(false);
      }
    },
    [agentKey, customPrompt, params, replace, sessionId, toast],
  );

  /* ---------- regenerate the last assistant reply ---------- */
  const regenerate = useCallback(async () => {
    if (sendingRef.current || !sessionId) return;
    sendingRef.current = true;
    setSending(true);
    try {
      const data = await postJSON<ChatSendResponse>("/api/chat", {
        sessionId,
        agent: agentKey,
        regenerate: true,
        ...(customPrompt ? { customPrompt } : {}),
      });
      setMessages((prev) => {
        const next = [...prev];
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i].role === "assistant") {
            next[i] = { ...next[i], id: `local-a-${Date.now()}`, content: data.reply };
            break;
          }
        }
        return next;
      });
    } catch (err) {
      toast({
        title: "Regeneration failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }, [agentKey, customPrompt, sessionId, toast]);

  /* ---------- auto-scroll to bottom on new activity ---------- */
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, sending]);

  /* ---------- input handling ---------- */
  const submit = useCallback(() => {
    const text = draft.trim();
    if (!text || sendingRef.current) return;
    setDraft("");
    setFileName(null);
    void send(text);
  }, [draft, send]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const onPickFile = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      try {
        const text = await file.text();
        setFileName(file.name);
        setDraft(`[File: ${file.name}]\n\n${text.slice(0, MAX_FILE_CHARS)}`);
      } catch {
        toast({ title: "Couldn't read that file", variant: "destructive" });
      }
    },
    [toast],
  );

  const retry = useCallback(() => {
    const text = lastFailed;
    setLastFailed(null);
    if (text) void send(text);
  }, [lastFailed, send]);

  const lastAssistantIndex = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return i;
    }
    return -1;
  }, [messages]);

  const waitingSeed = Boolean(seed) && !seedSentRef.current;
  const showEmptyState = !booting && messages.length === 0 && !sending && !lastFailed && !waitingSeed;

  return (
    <div className="flex h-full flex-col">
      {/* ---------- body ---------- */}
      {booting ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-1.5">
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-neon/80" style={{ animationDelay: "0s" }} />
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-neon/80" style={{ animationDelay: "0.15s" }} />
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-neon/80" style={{ animationDelay: "0.3s" }} />
          </div>
        </div>
      ) : showEmptyState ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-6 text-center">
          <LogoMark size={56} glow />
          <h2 className="mt-4 font-display text-xl font-bold">{displayName}</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">{tagline}</p>
          <div className="mt-7 flex w-full max-w-[340px] flex-col gap-2">
            {suggestions.slice(0, 3).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => void send(s)}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[13px] transition hover:border-neon/40 hover:text-neon"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          <div className="flex flex-col gap-4">
            {messages.map((m, i) => (
              <MessageBubble
                key={m.id}
                msg={m}
                agentIcon={AgentIcon}
                isLastAssistant={i === lastAssistantIndex}
                busy={sending}
                onRegenerate={() => void regenerate()}
              />
            ))}
            {sending && <TypingIndicator icon={AgentIcon} />}
            {lastFailed && (
              <div className="mr-auto max-w-[85%] rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-[13px] text-rose-300">
                <p className="break-words">Message couldn&apos;t be sent — please try again.</p>
                <button
                  type="button"
                  onClick={retry}
                  className="mt-2 rounded-full border border-rose-400/40 bg-rose-500/15 px-3 py-1 text-[12px] font-semibold text-rose-200 transition hover:bg-rose-500/25"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------- input bar ---------- */}
      <div className="shrink-0 border-t border-white/[0.06] bg-background/90 px-3 pb-3 pt-2.5 backdrop-blur-xl">
        {fileName && (
          <div className="mb-2 flex items-center gap-2 px-1">
            <span className="flex max-w-[75%] items-center gap-1.5 rounded-full border border-neon/30 bg-neon/10 px-3 py-1 text-[12px] text-neon">
              <FileText className="h-3 w-3 shrink-0" />
              <span className="truncate">{fileName}</span>
            </span>
            <button
              type="button"
              aria-label="Remove attachment"
              onClick={() => {
                setFileName(null);
                setDraft("");
              }}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.json,.log,.csv"
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
            onChange={(e) => void onPickFile(e)}
          />
          <button
            type="button"
            aria-label="Attach a text file"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-white/5 hover:text-neon"
          >
            <Paperclip className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            aria-label="Voice input (coming soon)"
            onClick={() => toast({ title: "Voice input is coming in v1.1" })}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-white/5 hover:text-neon"
          >
            <Mic className="h-4.5 w-4.5" />
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={PLACEHOLDERS[agentKey] ?? "Type your message..."}
            aria-label="Message input"
            className="flex-1 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[14px] outline-none focus:border-neon/50"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            aria-label="Send message"
            className="h-10 w-10 shrink-0 rounded-full bg-neon text-black shadow-[0_0_24px_-4px_var(--neon)] transition active:scale-95 disabled:opacity-40"
          >
            <Send className="ml-0.5 h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
