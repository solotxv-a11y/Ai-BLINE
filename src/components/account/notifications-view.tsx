"use client";

import { useState } from "react";
import { Bell, Lightbulb, Mail } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Switch } from "@/components/ui/switch";
import { ViewHeader } from "./parts";

export default function NotificationsView() {
  const { notifPush, setNotifPush, notifEmail, setNotifEmail } = useAppStore();
  const [weeklyTip, setWeeklyTip] = useState(true);

  const rows = [
    {
      icon: Bell,
      title: "Push notifications",
      description: "Lesson reminders and security alerts",
      checked: notifPush,
      onChange: setNotifPush,
      label: "Toggle push notifications",
    },
    {
      icon: Lightbulb,
      title: "Weekly security tip",
      description: "One practical tip every week",
      checked: weeklyTip,
      onChange: setWeeklyTip,
      label: "Toggle weekly security tip",
    },
    {
      icon: Mail,
      title: "Email digest",
      description: "Monthly summary of your progress",
      checked: notifEmail,
      onChange: setNotifEmail,
      label: "Toggle email digest",
    },
  ];

  return (
    <div className="px-5 pt-5 pb-8">
      <ViewHeader title="Notifications" subtitle="Choose what to hear about" />

      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] divide-y divide-white/[0.06]">
        {rows.map((row) => (
          <div key={row.title} className="flex items-center gap-3.5 px-4 py-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-foreground/80">
              <row.icon className="h-4.5 w-4.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14.5px] font-medium">{row.title}</span>
              <span className="mt-0.5 block text-[11.5px] text-muted-foreground">{row.description}</span>
            </span>
            <Switch checked={row.checked} onCheckedChange={row.onChange} aria-label={row.label} />
          </div>
        ))}
      </div>
    </div>
  );
}
