"use client";

import { Download, FileText, FileJson } from "lucide-react";
import { exportToMarkdown, exportToPDF } from "@/lib/export";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ExportButtonsProps {
  title: string;
  summary: string;
  highlights: any[];
}

export function ExportButtons({ title, summary, highlights }: ExportButtonsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
      >
        <Download className="w-4 h-4" /> Export
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 glass rounded-2xl border border-white/10 p-2 z-10 shadow-2xl">
          <button
            onClick={() => {
              exportToMarkdown(title, summary, highlights);
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-sm transition-colors"
          >
            <FileText className="w-4 h-4" /> Markdown (.md)
          </button>
          <button
            onClick={() => {
              exportToPDF(title, summary, highlights);
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-sm transition-colors"
          >
            <FileJson className="w-4 h-4" /> PDF Report
          </button>
        </div>
      )}
    </div>
  );
}
