"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TriangleAlert } from "lucide-react";

type LineType = "input" | "output" | "error" | "neon";

interface TermLine {
  type: LineType;
  text: string;
}

const WELCOME_LINES: TermLine[] = [
  { type: "neon", text: "Ai BLINE Practice Lab v1.0" },
  { type: "output", text: "Simulated environment — type 'help' to list commands. Nothing here touches real systems." },
];

const HELP_TEXT = [
  "Available commands:",
  "  help              list all commands",
  "  about             what this lab is (and is not)",
  "  whoami            who you are in the lab",
  "  ls                list lab files",
  "  cat <file>        read readme.txt or tools.md",
  "  scan <target>     simulated nmap-style network scan",
  "  ping <host>       simulated ICMP echo",
  "  hash <text>       compute a real SHA-256 digest",
  "  date              current date & time",
  "  clear             clear the terminal",
  "  sudo              …try it and see",
  "  exploit           …try it and see",
];

const README_TEXT = [
  "Ai BLINE Practice Lab — ground rules",
  "",
  "1. Nothing here sends real network traffic. All output is fictional.",
  "2. Only ever scan or test systems you own or have written permission to test.",
  "3. Learn defensively: understand attacks so you can build better defenses.",
  "4. When in doubt, ask before you act — in the lab and in real life.",
  "",
  "This lab exists so curiosity never becomes a legal problem.",
];

const TOOLS_TEXT = [
  "Common legal security tools (use only on your own lab):",
  "",
  "  nmap        network discovery & service enumeration",
  "  wireshark   deep packet & protocol analysis",
  "  john        local password strength auditing",
  "  hashcat     GPU password auditing (own hashes only)",
  "  lynis       Linux hardening audit & scoring",
  "  rkhunter    rootkit quick-check for your own box",
  "  burpsuite   web request inspection (authorized apps)",
  "  sqlmap      automated SQLi testing (lab apps only)",
  "",
  "Remember: a tool is only legal when your authorization is.",
];

const SCAN_OUTPUT: TermLine[] = [
  { type: "output", text: "Starting simulated scan of 192.168.1.0/24 (nmap 7.94 lab edition)" },
  { type: "output", text: "" },
  { type: "output", text: "Host 192.168.1.1   (lab-router.local)    — 2 ports open" },
  { type: "output", text: "  80/tcp    open  http         (router admin panel)" },
  { type: "output", text: "  443/tcp   open  https        (router admin panel)" },
  { type: "output", text: "Host 192.168.1.10  (dev-laptop.local)    — 3 ports open" },
  { type: "output", text: "  22/tcp    open  ssh          (OpenSSH 9.6)" },
  { type: "output", text: "  139/tcp   open  netbios-ssn" },
  { type: "output", text: "  445/tcp   open  microsoft-ds" },
  { type: "output", text: "Host 192.168.1.25  (raspberrypi.local)   — 2 ports open" },
  { type: "output", text: "  22/tcp    open  ssh          (OpenSSH 9.2)" },
  { type: "output", text: "  8080/tcp  open  http-proxy   (Node.js lab service)" },
  { type: "output", text: "" },
  { type: "output", text: "Scan complete: 3 hosts up, 7 open ports." },
  { type: "neon", text: "Simulated output for learning" },
];

const PROMPT = "aibline@lab:~$";

export function LabTerminal() {
  const [lines, setLines] = useState<TermLine[]>(WELCOME_LINES);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [busy, setBusy] = useState(false);

  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* auto-scroll to bottom on new output */
  useEffect(() => {
    const el = outputRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const pushLines = useCallback((newLines: TermLine[]) => {
    setLines((prev) => [...prev, ...newLines]);
  }, []);

  const execute = useCallback(
    async (raw: string) => {
      const cmd = raw.trim();
      if (!cmd) return;

      const [rawName, ...rawArgs] = cmd.split(/\s+/);
      const name = rawName.toLowerCase();
      const argText = rawArgs.join(" ");
      const argLower = argText.toLowerCase();

      /* ---------- synchronous commands ---------- */
      switch (name) {
        case "help":
          pushLines([{ type: "input", text: cmd }, ...HELP_TEXT.map((t): TermLine => ({ type: "output", text: t }))]);
          return;
        case "about":
          pushLines([
            { type: "input", text: cmd },
            { type: "output", text: "Ai BLINE Practice Lab — a safe, fully simulated terminal for learning command-line security basics." },
            { type: "output", text: "Every command runs locally against fiction; no packets ever leave this app." },
            { type: "neon", text: "Ethics first: only test systems you own or have written permission to test." },
          ]);
          return;
        case "whoami":
          pushLines([{ type: "input", text: cmd }, { type: "output", text: "lab-student (uid=1337) — future ethical defender" }]);
          return;
        case "ls":
          pushLines([{ type: "input", text: cmd }, { type: "output", text: "readme.txt  targets/  tools.md" }]);
          return;
        case "cat":
          if (argLower === "readme.txt") {
            pushLines([
              { type: "input", text: cmd },
              ...README_TEXT.map((t): TermLine => ({ type: "output", text: t })),
            ]);
          } else if (argLower === "tools.md") {
            pushLines([
              { type: "input", text: cmd },
              ...TOOLS_TEXT.map((t): TermLine => ({ type: "output", text: t })),
            ]);
          } else if (argLower === "targets" || argLower === "targets/") {
            pushLines([
              { type: "input", text: cmd },
              { type: "output", text: "192.168.1.0/24  (simulated lab range — try: scan 192.168.1.0/24)" },
            ]);
          } else {
            pushLines([
              { type: "input", text: cmd },
              { type: "error", text: `cat: ${argText || "<file>"}: No such file or directory` },
            ]);
          }
          return;
        case "scan":
          if (!argText) {
            pushLines([{ type: "input", text: cmd }, { type: "error", text: "usage: scan <cidr|host>" }]);
          } else {
            pushLines([{ type: "input", text: cmd }, ...SCAN_OUTPUT.map((l) => ({ ...l }))]);
          }
          return;
        case "ping": {
          if (!argText) {
            pushLines([{ type: "input", text: cmd }, { type: "error", text: "usage: ping <host>" }]);
            return;
          }
          const times = ["0.412", "0.388", "0.401", "0.395"];
          pushLines([
            { type: "input", text: cmd },
            { type: "output", text: `PING ${argText} (192.168.1.1) 56(84) bytes of data. (simulated)` },
            ...times.map(
              (t, i): TermLine => ({
                type: "output",
                text: `64 bytes from ${argText}: icmp_seq=${i + 1} ttl=64 time=${t} ms`,
              }),
            ),
            { type: "output", text: `--- ${argText} ping statistics ---` },
            { type: "output", text: "4 packets transmitted, 4 received, 0% packet loss" },
          ]);
          return;
        }
        case "date":
          pushLines([{ type: "input", text: cmd }, { type: "output", text: new Date().toString() }]);
          return;
        case "clear":
          setLines([]);
          return;
        case "sudo":
          pushLines([
            { type: "input", text: cmd },
            { type: "error", text: "lab-student is not in the sudoers file. This incident will be reported… to your conscience. 🤖" },
          ]);
          return;
        case "exploit":
          pushLines([
            { type: "input", text: cmd },
            { type: "error", text: "Refused: the lab teaches defense-first ethics. Try 'scan' on the lab range or read 'cat tools.md'." },
          ]);
          return;
        case "nmap":
          pushLines([
            { type: "input", text: cmd },
            { type: "output", text: "note: 'nmap' is aliased to 'scan' in this lab. Try: scan 192.168.1.0/24" },
          ]);
          return;
        case "hash":
          break; /* handled async below */
        default:
          pushLines([
            { type: "input", text: cmd },
            { type: "error", text: `command not found: ${rawName} — type 'help'` },
          ]);
          return;
      }

      /* ---------- async: real SHA-256 via crypto.subtle ---------- */
      if (name === "hash") {
        if (!argText) {
          pushLines([{ type: "input", text: cmd }, { type: "error", text: "usage: hash <text>" }]);
          return;
        }
        setBusy(true);
        try {
          const data = new TextEncoder().encode(argText);
          const digest = await crypto.subtle.digest("SHA-256", data);
          const hex = Array.from(new Uint8Array(digest))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
          pushLines([
            { type: "input", text: cmd },
            { type: "output", text: `SHA-256 ("${argText}") =` },
            { type: "neon", text: hex },
          ]);
        } catch {
          pushLines([
            { type: "input", text: cmd },
            { type: "error", text: "hash: crypto engine unavailable in this browser" },
          ]);
        } finally {
          setBusy(false);
        }
      }
    },
    [pushLines],
  );

  const run = useCallback(
    (raw: string) => {
      const cmd = raw.trim();
      if (!cmd) return;
      setHistory((h) => [...h, cmd]);
      setHistIdx(-1);
      setInput("");
      void execute(cmd);
    },
    [execute],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(input);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const idx = histIdx === -1 ? history.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(idx);
      setInput(history[idx]);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx === -1) return;
      const idx = histIdx + 1;
      if (idx >= history.length) {
        setHistIdx(-1);
        setInput("");
      } else {
        setHistIdx(idx);
        setInput(history[idx]);
      }
    }
  };

  const lineClass: Record<LineType, string> = {
    input: "text-foreground",
    output: "text-foreground/75",
    error: "text-rose-400",
    neon: "text-neon",
  };

  return (
    <div className="flex h-full flex-col px-4 pt-4 pb-4">
      {/* simulated banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-4">
        <TriangleAlert className="mt-0.5 h-4.5 w-4.5 shrink-0 text-amber-400" aria-hidden="true" />
        <p className="text-[12px] leading-relaxed text-amber-200/80">
          Simulated lab — every command below is fictional and runs locally. Nothing touches real systems. Practice
          legally: only ever test networks and devices you own or have written permission to test.
        </p>
      </div>

      {/* terminal */}
      <div
        className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-neon/25 bg-black/85 shadow-[0_0_40px_-12px_var(--neon)]"
        onClick={() => inputRef.current?.focus()}
      >
        {/* title bar */}
        <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" aria-hidden="true" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" aria-hidden="true" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" aria-hidden="true" />
          <span className="flex-1 text-center text-[11px] text-muted-foreground">aibline@lab: ~/practice</span>
          <span className="w-[38px]" aria-hidden="true" />
        </div>

        {/* output */}
        <div
          ref={outputRef}
          className="min-h-0 flex-1 overflow-y-auto p-3.5 font-mono text-[12.5px] leading-relaxed"
          aria-live="polite"
        >
          {lines.map((line, i) =>
            line.type === "input" ? (
              <p key={i} className={`whitespace-pre-wrap break-words ${lineClass[line.type]}`}>
                <span className="text-neon">{PROMPT} </span>
                {line.text}
              </p>
            ) : (
              <p key={i} className={`whitespace-pre-wrap break-words ${lineClass[line.type]}`}>
                {line.text || "\u00A0"}
              </p>
            ),
          )}
        </div>

        {/* input row */}
        <div className="flex items-center gap-2 border-t border-white/[0.06] px-3.5 py-2.5 font-mono text-[12.5px]">
          <span className="shrink-0 text-neon" aria-hidden="true">
            {PROMPT}
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={busy}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            aria-label="Lab terminal command input"
            placeholder="type a command…"
            className="min-w-0 flex-1 bg-transparent text-foreground caret-neon outline-none placeholder:text-muted-foreground/50 disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
}

export default LabTerminal;
