"use client";

import { useAppStore } from "@/lib/store";
import { COLOR_MAP, TOOLS } from "@/lib/colors";
import ToolDetail from "@/components/tools/tool-detail";

export default function ToolsScreen() {
  const stack = useAppStore((s) => s.stacks.tools);
  const push = useAppStore((s) => s.push);

  const top = stack[stack.length - 1];

  if (top.name === "tool" && typeof top.params?.toolId === "string") {
    return <ToolDetail toolId={top.params.toolId} />;
  }

  return (
    <div className="px-5 pt-5 pb-8">
      <h1 className="font-display text-[26px] font-bold tracking-tight">Tools</h1>
      <p className="mt-1 text-[13px] text-muted-foreground">Everything you need to stay safe</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {TOOLS.map((tool) => {
          const c = COLOR_MAP[tool.color];
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => push("tool", { toolId: tool.id })}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 text-left transition-all hover:border-neon/40 active:scale-[0.99]"
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${c.border} ${c.bg} ${c.text} ${c.glowShadow}`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="mt-3 text-[14px] font-semibold leading-snug">{tool.name}</p>
              <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">{tool.short}</p>
              {tool.simulated ? (
                <p className="mt-2 text-[9.5px] font-bold tracking-wider text-amber-400/80">SIMULATED</p>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
