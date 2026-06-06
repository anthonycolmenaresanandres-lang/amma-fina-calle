"use client";

import { useState } from "react";
import { PROMPT_SYSTEMS, type PromptSystem } from "./promptSystems";

// Splits a prompt into plain text and [bracketed] fill-in tokens so the tokens
// can be highlighted in champagne gold. Keeps line breaks intact via <pre>.
function renderPromptBody(prompt: string) {
  const parts = prompt.split(/(\[[^\]]+\])/g);
  return parts.map((part, i) =>
    part.startsWith("[") && part.endsWith("]") ? (
      <span
        key={i}
        className="rounded-[0.3rem] bg-[#d8b36d]/12 px-1 font-medium text-[#e3c47f]"
      >
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function tokenCount(prompt: string) {
  return new Set(prompt.match(/\[[^\]]+\]/g) ?? []).size;
}

function SystemCard({ system }: { system: PromptSystem }) {
  const [copied, setCopied] = useState(false);

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(system.prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked (insecure context / permissions) — fail quietly.
    }
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#cfd6da]/14 bg-[#07090b]/80 p-6 shadow-[0_28px_70px_-50px_rgba(0,0,0,0.9)] backdrop-blur transition hover:border-[#d8b36d]/45 hover:bg-[#0b0e11]/90 sm:p-7">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#d8b36d]/55 to-transparent opacity-60 transition group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-4">
        <span className="font-mono text-3xl font-semibold leading-none text-[#d8b36d]">
          {system.number}
        </span>
        <span className="rounded-full border border-[#cfd6da]/16 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-[#aeb7bd]">
          {tokenCount(system.prompt)} inputs
        </span>
      </div>

      <h3 className="mt-5 text-xl font-semibold leading-snug text-[#f1f4f5]">
        {system.name}
      </h3>
      <p className="mt-2 text-sm leading-6 text-[#9aa3a9]">{system.tagline}</p>

      <pre className="mt-5 flex-1 whitespace-pre-wrap rounded-xl border border-[#cfd6da]/10 bg-[#040506]/80 p-4 font-sans text-[0.82rem] leading-6 text-[#c8d0d4]">
        {renderPromptBody(system.prompt)}
      </pre>

      <button
        type="button"
        onClick={copyPrompt}
        aria-label={`Copy the ${system.name} prompt`}
        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d8b36d]/55 bg-[#f4f6f7] px-5 text-xs font-black uppercase tracking-[0.18em] text-[#050607] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d8b36d]"
      >
        <span
          className="h-1.5 w-1.5 rounded-full bg-[#d8b36d] shadow-[0_0_12px_rgba(216,179,109,0.8)]"
          aria-hidden
        />
        {copied ? "Copied to clipboard" : "Copy prompt"}
      </button>
    </article>
  );
}

export default function PromptSystemGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {PROMPT_SYSTEMS.map((system) => (
        <SystemCard key={system.number} system={system} />
      ))}
    </div>
  );
}
