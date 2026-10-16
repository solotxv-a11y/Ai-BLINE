"use client";

import { COLOR_MAP } from "@/lib/colors";
import { getToolDef, SimulatedBanner } from "@/components/tools/shared";
import LinkAnalyzer from "@/components/tools/link-analyzer";
import DataLeak from "@/components/tools/data-leak";
import PasswordTool from "@/components/tools/password-tool";
import VulnGuide from "@/components/tools/vuln-guide";
import CodeHelper from "@/components/tools/code-helper";
import NetworkScanner from "@/components/tools/network-scanner";
import LogAnalyzer from "@/components/tools/log-analyzer";
import Translator from "@/components/tools/translator";

const SIMULATED_BANNERS: Record<string, string> = {
  "data-leak":
    "Demo dataset — breach results are simulated for education and never sent anywhere.",
  "network-scanner":
    "Simulated Lab Mode — devices and results are generated for learning. Never scan networks you do not own or have written permission to test.",
};

const FALLBACK_BANNER =
  "This tool runs in simulated mode — results are generated for education and never sent anywhere.";

function ToolBody({ toolId }: { toolId: string }) {
  switch (toolId) {
    case "link-analyzer":
      return <LinkAnalyzer />;
    case "data-leak":
      return <DataLeak />;
    case "password":
      return <PasswordTool />;
    case "vuln-guide":
      return <VulnGuide />;
    case "code-helper":
      return <CodeHelper />;
    case "network-scanner":
      return <NetworkScanner />;
    case "log-analyzer":
      return <LogAnalyzer />;
    case "translator":
      return <Translator />;
    default:
      return null;
  }
}

export default function ToolDetail({ toolId }: { toolId: string }) {
  const tool = getToolDef(toolId);

  if (!tool) {
    return (
      <div className="px-5 pt-5 pb-8">
        <p className="text-sm text-muted-foreground">Tool not found.</p>
      </div>
    );
  }

  const c = COLOR_MAP[tool.color];
  const Icon = tool.icon;

  return (
    <div className="px-5 pt-5 pb-8">
      {/* Header */}
      <div className="flex items-start gap-3.5">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${c.border} ${c.bg} ${c.text} ${c.glowShadow}`}
        >
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-[20px] font-bold">{tool.name}</h1>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{tool.description}</p>
        </div>
      </div>

      {/* Simulated disclosure */}
      {tool.simulated ? (
        <div className="mt-4">
          <SimulatedBanner text={SIMULATED_BANNERS[tool.id] ?? FALLBACK_BANNER} />
        </div>
      ) : null}

      {/* Body */}
      <div className="mt-5">
        <ToolBody toolId={tool.id} />
      </div>
    </div>
  );
}
