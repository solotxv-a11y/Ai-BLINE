"use client";

import type { KeyboardEvent, ReactNode } from "react";
import {
  Bell,
  Bookmark,
  ChevronRight,
  Clock,
  Globe,
  Info,
  Palette,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Switch } from "@/components/ui/switch";
import HistoryView from "@/components/account/history-view";
import SavedView from "@/components/account/saved-view";
import AppearanceView from "@/components/account/appearance-view";
import LanguageView from "@/components/account/language-view";
import NotificationsView from "@/components/account/notifications-view";
import PrivacyView from "@/components/account/privacy-view";
import AboutView from "@/components/account/about-view";
import PlansView from "@/components/account/plans-view";

/** Clickable menu row. Uses a div (role=button) because rows can contain a Switch (also a button). */
function MenuRow({
  icon: Icon,
  label,
  onClick,
  trailing,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  trailing?: ReactNode;
}) {
  function handleKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  }

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? handleKey : undefined}
      className="flex w-full items-center gap-3.5 px-4 py-4 text-left transition-colors hover:bg-white/[0.03]"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-foreground/80">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <span className="min-w-0 flex-1 text-[14.5px] font-medium">{label}</span>
      {trailing ?? <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
    </div>
  );
}

function AccountMenu() {
  const { push, notifPush, setNotifPush, localOnlyHistory, setLocalOnlyHistory } = useAppStore();

  return (
    <div className="px-5 pt-5 pb-8">
      <h1 className="font-display text-[26px] font-bold tracking-tight">Account</h1>
      <p className="mt-1 text-[13px] text-muted-foreground">Profile, history and preferences</p>

      {/* profile card */}
      <div className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neon/90 to-violet-500/90 font-display text-2xl font-bold text-black shadow-[0_0_28px_-6px_var(--neon)] ring-2 ring-neon/30">
            A
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-xl font-bold">Amir</p>
            <p className="text-[12.5px] text-muted-foreground">@AiBLINE_User</p>
            <span className="mt-1.5 inline-block rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[10.5px] text-muted-foreground">
              Free Plan
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => push("plans")}
          className="mt-4 h-10 w-full rounded-full bg-gradient-to-r from-neon via-teal-300 to-violet-400 gradient-flow text-[14px] font-bold text-black shadow-[0_0_28px_-6px_var(--neon)] transition active:scale-[0.99]"
        >
          Upgrade to Pro
        </button>
      </div>

      {/* menu */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] divide-y divide-white/[0.06]">
        <MenuRow icon={Clock} label="Chat History" onClick={() => push("history")} />
        <MenuRow icon={Bookmark} label="Saved" onClick={() => push("saved")} />
        <MenuRow icon={Palette} label="Appearance" onClick={() => push("appearance")} />
        <MenuRow icon={Globe} label="Language" onClick={() => push("language")} />
        <MenuRow
          icon={Bell}
          label="Notifications"
          onClick={() => push("notifications")}
          trailing={
            <Switch
              checked={notifPush}
              onCheckedChange={setNotifPush}
              onClick={(e) => e.stopPropagation()}
              aria-label="Toggle push notifications"
            />
          }
        />
        <MenuRow
          icon={ShieldCheck}
          label="Privacy"
          onClick={() => push("privacy")}
          trailing={
            <Switch
              checked={localOnlyHistory}
              onCheckedChange={setLocalOnlyHistory}
              onClick={(e) => e.stopPropagation()}
              aria-label="Toggle local-only history"
            />
          }
        />
        <MenuRow icon={Info} label="About" onClick={() => push("about")} />
      </div>

      <p className="mt-6 text-center text-[11px] text-muted-foreground/60">Ai BLINE v1.0.0 — Black Line build</p>
    </div>
  );
}

export default function AccountScreen() {
  const stack = useAppStore((s) => s.stacks.account);
  const top = stack[stack.length - 1];

  switch (top.name) {
    case "history":
      return <HistoryView />;
    case "saved":
      return <SavedView />;
    case "appearance":
      return <AppearanceView />;
    case "language":
      return <LanguageView />;
    case "notifications":
      return <NotificationsView />;
    case "privacy":
      return <PrivacyView />;
    case "about":
      return <AboutView />;
    case "plans":
      return <PlansView />;
    default:
      return <AccountMenu />;
  }
}
