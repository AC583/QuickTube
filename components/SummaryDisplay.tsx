"use client";

import ReactMarkdown from "react-markdown";

export function SummaryDisplay({ content }: { content: string }) {
  return (
    <div className="prose prose-invert max-w-none prose-headings:mb-4 prose-p:text-zinc-400 prose-li:text-zinc-400 prose-headings:text-white">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
