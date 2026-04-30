"use client";

import { Play } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface Highlight {
  time: number;
  label: string;
}

export function TimestampList({ highlights, videoId }: { highlights: Highlight[], videoId: string }) {
  const handleClick = (seconds: number) => {
    // Usually we would control an iframe player here, 
    // but for simplicity we can just reload the iframe with the timestamp
    const iframe = document.querySelector("iframe");
    if (iframe) {
      iframe.src = `https://www.youtube.com/embed/${videoId}?start=${seconds}&autoplay=1`;
    }
  };

  return (
    <div className="space-y-3">
      {highlights.map((h, i) => (
        <button
          key={i}
          onClick={() => handleClick(h.time)}
          className="w-full flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors shrink-0">
            <Play className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-200">{h.label}</div>
            <div className="text-xs text-zinc-500 font-mono">{formatTime(h.time)}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
