"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Tab = "home" | "agents" | "academy" | "tools" | "account";

export type ViewName =
  | "menu" // home root
  | "chat" // chat view (home & agents)
  | "list" // agents root
  | "overview" // academy root
  | "path" // academy path detail
  | "lesson" // academy lesson
  | "lab" // academy practice lab
  | "grid" // tools root
  | "tool" // tool detail
  | "history" // account: chat history
  | "saved" // account: saved items
  | "appearance" // account: appearance
  | "language" // account: language
  | "notifications" // account: notifications
  | "privacy" // account: privacy
  | "about" // account: about
  | "plans"; // account: plans

export interface ViewState {
  name: ViewName;
  params?: Record<string, unknown>;
}

type Stacks = Record<Tab, ViewState[]>;

const ROOT_VIEW: Record<Tab, ViewName> = {
  home: "menu",
  agents: "list",
  academy: "overview",
  tools: "grid",
  account: "menu",
};

const initialStacks: Stacks = {
  home: [{ name: "menu" }],
  agents: [{ name: "list" }],
  academy: [{ name: "overview" }],
  tools: [{ name: "grid" }],
  account: [{ name: "menu" }],
};

export type AccentChoice = "neon" | "violet" | "green" | "rose";

interface AppState {
  tab: Tab;
  stacks: Stacks;

  setTab: (tab: Tab) => void;
  /** push a view on top of the current tab's stack */
  push: (name: ViewName, params?: Record<string, unknown>) => void;
  /** replace the top view of the current tab's stack */
  replace: (name: ViewName, params?: Record<string, unknown>) => void;
  /** go one step back inside the current tab */
  back: () => void;
  /** reset the current (or given) tab to its root view */
  resetToRoot: (tab?: Tab) => void;

  /** convenience: open chat for an agent/session */
  openChat: (opts: { sessionId?: string; agent?: string; seed?: string; customAgentName?: string }) => void;
  /** convenience: jump straight to a tool */
  openTool: (toolId: string) => void;

  /* ---------- appearance & settings (persisted) ---------- */
  accent: AccentChoice;
  amoled: boolean;
  reduceMotion: boolean;
  notifPush: boolean;
  notifEmail: boolean;
  localOnlyHistory: boolean;
  setAccent: (a: AccentChoice) => void;
  setAmoled: (v: boolean) => void;
  setReduceMotion: (v: boolean) => void;
  setNotifPush: (v: boolean) => void;
  setNotifEmail: (v: boolean) => void;
  setLocalOnlyHistory: (v: boolean) => void;
}

function withEffects(state: AppState) {
  if (typeof document !== "undefined") {
    const el = document.documentElement;
    el.dataset.accent = state.accent;
    if (state.amoled) el.dataset.theme = "amoled";
    else delete el.dataset.theme;
    el.classList.toggle("reduce-motion", state.reduceMotion);
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      tab: "home",
      stacks: initialStacks,

      setTab: (tab) => set({ tab }),

      push: (name, params) =>
        set((s) => ({
          stacks: {
            ...s.stacks,
            [s.tab]: [...s.stacks[s.tab], params ? { name, params } : { name }],
          },
        })),

      replace: (name, params) =>
        set((s) => {
          const stack = [...s.stacks[s.tab]];
          stack[stack.length - 1] = params ? { name, params } : { name };
          return { stacks: { ...s.stacks, [s.tab]: stack } };
        }),

      back: () =>
        set((s) => {
          const stack = s.stacks[s.tab];
          if (stack.length <= 1) return {};
          return { stacks: { ...s.stacks, [s.tab]: stack.slice(0, -1) } };
        }),

      resetToRoot: (tab) => {
        const t = tab ?? get().tab;
        set((s) => ({
          tab: t,
          stacks: { ...s.stacks, [t]: [{ name: ROOT_VIEW[t] }] },
        }));
      },

      openChat: ({ sessionId, agent, seed, customAgentName }) => {
        const tab: Tab = agent && agent !== "general" ? "agents" : "home";
        set((s) => ({
          tab,
          stacks: {
            ...s.stacks,
            [tab]: [
              { name: tab === "agents" ? "list" : "menu" },
              {
                name: "chat",
                params: { ...(sessionId ? { sessionId } : {}), ...(agent ? { agent } : {}), ...(seed ? { seed } : {}), ...(customAgentName ? { customAgentName } : {}) },
              },
            ],
          },
        }));
      },

      openTool: (toolId) =>
        set((s) => ({
          tab: "tools",
          stacks: { ...s.stacks, tools: [{ name: "grid" }, { name: "tool", params: { toolId } }] },
        })),

      accent: "neon",
      amoled: false,
      reduceMotion: false,
      notifPush: true,
      notifEmail: false,
      localOnlyHistory: true,
      setAccent: (accent) => set({ accent } as Partial<AppState>),
      setAmoled: (amoled) => set({ amoled } as Partial<AppState>),
      setReduceMotion: (reduceMotion) => set({ reduceMotion } as Partial<AppState>),
      setNotifPush: (notifPush) => set({ notifPush } as Partial<AppState>),
      setNotifEmail: (notifEmail) => set({ notifEmail } as Partial<AppState>),
      setLocalOnlyHistory: (localOnlyHistory) => set({ localOnlyHistory } as Partial<AppState>),
    }),
    {
      name: "aibline-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        accent: s.accent,
        amoled: s.amoled,
        reduceMotion: s.reduceMotion,
        notifPush: s.notifPush,
        notifEmail: s.notifEmail,
        localOnlyHistory: s.localOnlyHistory,
      }),
    },
  ),
);

/** Apply appearance effects (used on mount and after changes) */
export function applyAppearance() {
  withEffects(useAppStore.getState());
}

// Reactive effects whenever persisted appearance fields change
if (typeof window !== "undefined") {
  useAppStore.subscribe((state) => withEffects(state));
}
