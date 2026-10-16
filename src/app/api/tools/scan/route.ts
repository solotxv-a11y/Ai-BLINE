import { complete, extractJson, jsonError, type LlmMessage } from "@/lib/llm";
import type { ScannedHost, ScanResult } from "@/lib/types";
import {
  asInt,
  asNarrowSeverity,
  asRecord,
  asString,
  FAIL_MSG,
  systemMessage,
} from "../_shared";

export const runtime = "nodejs";

const SCHEMA =
  '{"hosts":[{"ip":string,"hostname":string,"mac":string,"vendor":string,"os":string,"openPorts":[{"port":number,"service":string,"state":"open"}],"risk":"low"|"medium"|"high"}],"summary":string}';

function asPort(value: unknown): { port: number; service: string; state: string } | null {
  const o = asRecord(value);
  const port = asInt(o.port, 0, 0, 65535);
  if (port === 0) return null;
  return {
    port,
    service: asString(o.service, "unknown"),
    state: asString(o.state, "open"),
  };
}

function asHost(value: unknown): ScannedHost | null {
  const o = asRecord(value);
  const ip = asString(o.ip).trim();
  if (!ip) return null;
  return {
    ip,
    hostname: asString(o.hostname, ""),
    mac: asString(o.mac, ""),
    vendor: asString(o.vendor, ""),
    os: asString(o.os, ""),
    openPorts: (Array.isArray(o.openPorts) ? o.openPorts : [])
      .map(asPort)
      .filter((p): p is { port: number; service: string; state: string } => p !== null)
      .slice(0, 8),
    risk: asNarrowSeverity(["low", "medium", "high"] as const, o.risk, "low"),
  };
}

export async function POST(req: Request) {
  try {
    const body = asRecord(await req.json().catch(() => null));
    const target = asString(body.target).trim();

    if (!target) {
      return jsonError("Provide a target range or IP.", 400);
    }
    if (target.length > 200) {
      return jsonError("Target is too long.", 400);
    }
    if (!/^[a-zA-Z0-9.\-/:]+$/.test(target)) {
      return jsonError("Target looks invalid. Use an IP or CIDR range.", 400);
    }

    const userPayload = [
      `Task: Simulate an EDUCATIONAL network scan of "${target}".`,
      "Generate 3-5 realistic FICTIONAL devices consistent with the target: private IPs inside the range when a CIDR is given (or plausible neighbouring hosts for a single IP), realistic MACs in AA:BB:CC:DD:EE:FF format, vendors matching device roles (router, phone, PC, NAS, IoT device — generic names, no real companies), a plausible OS, 0-6 open ports each with a port number, service name and state \"open\", and a risk rating low|medium|high.",
      "summary: 2-4 sentences describing the network and 1-2 safety recommendations. Keep a friendly educational tone.",
    ].join("\n\n");

    const messages: LlmMessage[] = [
      {
        role: "assistant",
        content: systemMessage(
          SCHEMA,
          "This is a clearly-labelled simulation for learning. Never pretend to touch real networks.",
        ),
      },
      { role: "user", content: userPayload },
    ];

    const raw = await complete(messages);

    let parsed: unknown;
    try {
      parsed = extractJson<unknown>(raw);
    } catch {
      return jsonError(FAIL_MSG, 502);
    }

    const obj = asRecord(parsed);
    const hosts = (Array.isArray(obj.hosts) ? obj.hosts : [])
      .map(asHost)
      .filter((h): h is ScannedHost => h !== null)
      .slice(0, 6);

    const result: ScanResult = {
      simulated: true,
      target,
      hosts,
      summary: asString(obj.summary, "Simulated scan complete."),
    };

    return Response.json(result);
  } catch (err) {
    console.error("[api/tools/scan]", err);
    return jsonError(FAIL_MSG, 502);
  }
}
