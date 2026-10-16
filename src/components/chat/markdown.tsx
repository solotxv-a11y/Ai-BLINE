"use client";

import { memo, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { Check, Copy } from "lucide-react";

/* ---------- helpers ---------- */

function nodeToText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map((child) => nodeToText(child)).join("");
  if (typeof node === "object" && "props" in node) {
    const props = (node as { props?: { children?: ReactNode } }).props;
    return nodeToText(props?.children);
  }
  return "";
}

/* ---------- code block with header (language + copy) ---------- */

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  }, [code]);

  return (
    <div className="relative my-3 overflow-hidden rounded-xl border border-white/10 bg-black/70 font-mono text-[12.5px]">
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.03] px-3.5 py-1.5">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
          {language}
        </span>
        <button
          type="button"
          onClick={onCopy}
          aria-label={copied ? "Copied" : "Copy code"}
          className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground transition hover:bg-white/5 hover:text-neon"
        >
          {copied ? (
            <Check className="h-3 w-3 text-neon" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3.5">
        <code className="font-mono text-[12.5px] leading-relaxed text-foreground/90">{code}</code>
      </pre>
    </div>
  );
}

/* ---------- markdown component map ---------- */

const components = {
  pre({ children }: { children?: ReactNode }) {
    const child = Array.isArray(children)
      ? children.find(
          (c): c is React.ReactElement<{ className?: string; children?: ReactNode }> =>
            typeof c === "object" && c !== null && "props" in c,
        )
      : typeof children === "object" && children !== null && "props" in children
        ? (children as React.ReactElement<{ className?: string; children?: ReactNode }>)
        : undefined;

    const className = child?.props?.className ?? "";
    const match = /language-([\w-]+)/.exec(className);
    const language = match ? match[1] : "code";
    const raw = nodeToText(child?.props?.children ?? children).replace(/\n$/, "");

    return <CodeBlock language={language} code={raw} />;
  },
  code({ children }: { children?: ReactNode }) {
    return (
      <code className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[12.5px] text-neon">
        {children}
      </code>
    );
  },
  p({ children }: { children?: ReactNode }) {
    return <p className="my-2 break-words first:mt-0 last:mb-0">{children}</p>;
  },
  h1({ children }: { children?: ReactNode }) {
    return (
      <h1 className="mb-2 mt-4 break-words font-display text-[17px] font-bold first:mt-0">
        {children}
      </h1>
    );
  },
  h2({ children }: { children?: ReactNode }) {
    return (
      <h2 className="mb-2 mt-4 break-words font-display text-[16px] font-bold first:mt-0">
        {children}
      </h2>
    );
  },
  h3({ children }: { children?: ReactNode }) {
    return (
      <h3 className="mb-1.5 mt-3 break-words font-display text-[15px] font-semibold first:mt-0">
        {children}
      </h3>
    );
  },
  ul({ children }: { children?: ReactNode }) {
    return <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>;
  },
  ol({ children }: { children?: ReactNode }) {
    return <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>;
  },
  li({ children }: { children?: ReactNode }) {
    return <li className="break-words leading-relaxed marker:text-neon/70">{children}</li>;
  },
  strong({ children }: { children?: ReactNode }) {
    return <strong className="font-semibold text-white">{children}</strong>;
  },
  em({ children }: { children?: ReactNode }) {
    return <em className="italic text-foreground/90">{children}</em>;
  },
  a({ children, href }: { children?: ReactNode; href?: string }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-neon underline underline-offset-2"
      >
        {children}
      </a>
    );
  },
  blockquote({ children }: { children?: ReactNode }) {
    return (
      <blockquote className="my-2 border-l-2 border-neon/40 pl-3 text-muted-foreground">
        {children}
      </blockquote>
    );
  },
  hr() {
    return <hr className="my-3 border-white/10" />;
  },
};

/** Markdown renderer tuned for the chat bubbles (no remark-gfm — tables are skipped). */
export const Markdown = memo(function Markdown({ content }: { content: string }) {
  return (
    <div className="text-[14px] leading-relaxed text-foreground/95">
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
});
