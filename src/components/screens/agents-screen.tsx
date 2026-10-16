"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import {
  Bot,
  Brain,
  ChevronRight,
  Globe,
  Lock,
  MoreVertical,
  Plus,
  Sparkles,
  Terminal,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { AGENTS } from "@/lib/agents";
import { COLOR_MAP } from "@/lib/colors";
import type { AccentKey } from "@/lib/types";
import { ChatView } from "@/components/chat/chat-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";

export default function AgentsScreen() {
  // Top view of the agents tab's stack: "list" → agents list, "chat" → chat view
  const top = useAppStore((s) => {
    const stack = s.stacks.agents;
    return stack[stack.length - 1];
  });

  if (top.name === "chat") return <ChatView />;
  return <AgentsList />;
}

/* ============================ custom agents (localStorage) ============================ */

type CustomIconKey = "bot" | "sparkles" | "brain" | "terminal" | "globe" | "lock";

interface CustomAgent {
  id: string;
  name: string;
  tagline: string;
  color: AccentKey;
  prompt: string;
  icon: CustomIconKey;
}

const STORAGE_KEY = "aibline-custom-agents";

const CUSTOM_ICONS: { key: CustomIconKey; icon: LucideIcon }[] = [
  { key: "bot", icon: Bot },
  { key: "sparkles", icon: Sparkles },
  { key: "brain", icon: Brain },
  { key: "terminal", icon: Terminal },
  { key: "globe", icon: Globe },
  { key: "lock", icon: Lock },
];

const ACCENT_SWATCHES: { key: AccentKey; hex: string }[] = [
  { key: "neon", hex: "#2ee6c8" },
  { key: "violet", hex: "#a78bfa" },
  { key: "sky", hex: "#38bdf8" },
  { key: "emerald", hex: "#34d399" },
  { key: "amber", hex: "#fbbf24" },
  { key: "rose", hex: "#fb7185" },
];

const ACCENT_KEYS: AccentKey[] = ACCENT_SWATCHES.map((a) => a.key);
const ICON_KEYS: CustomIconKey[] = CUSTOM_ICONS.map((i) => i.key);

function readCustomAgents(): CustomAgent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const valid: CustomAgent[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const it = item as Record<string, unknown>;
      if (typeof it.id !== "string" || typeof it.name !== "string" || typeof it.prompt !== "string")
        continue;
      valid.push({
        id: it.id,
        name: it.name,
        tagline: typeof it.tagline === "string" ? it.tagline : "Custom agent",
        color: ACCENT_KEYS.includes(it.color as AccentKey) ? (it.color as AccentKey) : "neon",
        prompt: it.prompt,
        icon: ICON_KEYS.includes(it.icon as CustomIconKey) ? (it.icon as CustomIconKey) : "bot",
      });
    }
    return valid;
  } catch {
    return [];
  }
}

function writeCustomAgents(list: CustomAgent[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable */
  }
}

/* ============================ agents list ============================ */

function AgentsList() {
  const push = useAppStore((s) => s.push);
  const { toast } = useToast();

  const [customAgents, setCustomAgents] = useState<CustomAgent[]>([]);
  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<CustomAgent | null>(null);

  // create form
  const [name, setName] = useState<string>("");
  const [tagline, setTagline] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [icon, setIcon] = useState<CustomIconKey>("bot");
  const [color, setColor] = useState<AccentKey>("neon");

  // hydrate custom agents after mount (avoid SSR mismatch)
  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) setCustomAgents(readCustomAgents());
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const next = customAgents.filter((a) => a.id !== deleteTarget.id);
    setCustomAgents(next);
    writeCustomAgents(next);
    setDeleteTarget(null);
    toast({ title: "Agent deleted" });
  };

  const handleCreate = () => {
    const n = name.trim();
    const p = prompt.trim();
    if (n.length < 2) {
      toast({ title: "Give your agent a name first", variant: "destructive" });
      return;
    }
    if (p.length < 3) {
      toast({ title: "Describe what this agent should do", variant: "destructive" });
      return;
    }
    const agent: CustomAgent = {
      id: `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      name: n,
      tagline: tagline.trim() || "Custom agent",
      color,
      prompt: p,
      icon,
    };
    const next = [...customAgents, agent];
    setCustomAgents(next);
    writeCustomAgents(next);
    setName("");
    setTagline("");
    setPrompt("");
    setIcon("bot");
    setColor("neon");
    setCreateOpen(false);
    toast({ title: "Agent created" });
  };

  const iconButtonClass = (active: boolean) =>
    `flex h-10 w-10 items-center justify-center rounded-xl border transition ${
      active
        ? "border-neon/60 bg-neon/10 text-neon"
        : "border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="px-5 pt-6 pb-8">
      {/* header */}
      <h1 className="font-display text-[26px] font-bold">AI Agents</h1>
      <p className="mt-1 text-[13px] text-muted-foreground">An expert for every task</p>

      {/* built-in agents */}
      <div className="mt-6 flex flex-col gap-3">
        {AGENTS.map((a) => {
          const c = COLOR_MAP[a.color];
          return (
            <button
              key={a.key}
              type="button"
              onClick={() => push("chat", { agent: a.key })}
              className={`relative flex items-center gap-3.5 rounded-2xl border p-4 text-left transition-all active:scale-[0.99] ${
                a.recommended
                  ? "border-neon/50 bg-neon/[0.05] box-glow"
                  : "border-white/[0.07] bg-white/[0.03] hover:border-white/20"
              }`}
            >
              {a.recommended ? (
                <Badge className="absolute -top-2.5 right-4 rounded-full bg-neon px-2.5 py-0.5 text-[10px] font-bold text-black shadow-[0_0_14px_-2px_var(--neon)]">
                  Recommended
                </Badge>
              ) : null}
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${c.border} ${c.bg} ${c.text} ${c.glowShadow}`}
              >
                <a.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold">{a.name}</p>
                <p className="text-[12.5px] text-muted-foreground">{a.tagline}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          );
        })}

        {/* custom agents */}
        {customAgents.map((a) => {
          const c = COLOR_MAP[a.color];
          const Icon = CUSTOM_ICONS.find((i) => i.key === a.icon)?.icon ?? Bot;
          const openChat = () =>
            push("chat", { agent: "custom", customAgentName: a.name, customPrompt: a.prompt });
          const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openChat();
            }
          };
          return (
            <div
              key={a.id}
              role="button"
              tabIndex={0}
              onClick={openChat}
              onKeyDown={onKeyDown}
              aria-label={`Chat with ${a.name}`}
              className="relative flex cursor-pointer items-center gap-3.5 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 transition-all hover:border-white/20 active:scale-[0.99]"
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${c.border} ${c.bg} ${c.text} ${c.glowShadow}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold">{a.name}</p>
                <p className="truncate text-[12.5px] text-muted-foreground">{a.tagline}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label={`${a.name} options`}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="border-white/10 bg-[#0b1019]"
                >
                  <DropdownMenuItem
                    onClick={() => setDeleteTarget(a)}
                    className="text-rose-400 focus:bg-rose-500/10 focus:text-rose-300"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}

        {/* create custom agent */}
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-transparent p-4 text-[14px] font-medium text-muted-foreground transition hover:border-neon/40 hover:text-neon"
        >
          <Plus className="h-4 w-4" /> Create Custom Agent
        </button>
      </div>

      {/* delete confirmation */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="border-white/10 bg-[#0b1019]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete &ldquo;{deleteTarget?.name}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This custom agent and its prompt will be removed from this device. Conversations you
              already had stay in your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-transparent text-foreground hover:bg-white/5 hover:text-foreground">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-rose-500 text-white hover:bg-rose-500/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-[calc(100vw-2.5rem)] border-white/10 bg-[#0b1019] sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="font-display">Create Custom Agent</DialogTitle>
            <DialogDescription>
              Define a persona and its prompt. It stays on this device.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Agent name"
              maxLength={40}
              className="border-white/10 bg-white/[0.04]"
            />
            <Input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Short tagline (optional)"
              maxLength={60}
              className="border-white/10 bg-white/[0.04]"
            />
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe this agent's role and expertise..."
              rows={4}
              maxLength={4000}
              className="border-white/10 bg-white/[0.04]"
            />
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Icon
              </p>
              <div className="flex flex-wrap gap-2">
                {CUSTOM_ICONS.map((i) => (
                  <button
                    key={i.key}
                    type="button"
                    aria-label={`Icon ${i.key}`}
                    aria-pressed={icon === i.key}
                    onClick={() => setIcon(i.key)}
                    className={iconButtonClass(icon === i.key)}
                  >
                    <i.icon className="h-4.5 w-4.5" />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Color
              </p>
              <div className="flex flex-wrap gap-3">
                {ACCENT_SWATCHES.map((sw) => (
                  <button
                    key={sw.key}
                    type="button"
                    aria-label={`Color ${sw.key}`}
                    aria-pressed={color === sw.key}
                    onClick={() => setColor(sw.key)}
                    style={{ backgroundColor: sw.hex }}
                    className={`h-8 w-8 rounded-full transition ${
                      color === sw.key ? "ring-2 ring-white/70 ring-offset-2 ring-offset-[#0b1019]" : ""
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              className="border-white/10 bg-transparent hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              className="bg-neon text-black shadow-[0_0_24px_-6px_var(--neon)] hover:bg-neon/90"
            >
              Create agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
