"use client";

import Link from "next/link";
import { Video, History, Info } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-white/10 px-6 py-4 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <Video className="text-black w-5 h-5" />
        </div>
        <span className="font-bold text-xl tracking-tight">Video Insight AI</span>
      </Link>
      
      <div className="flex items-center gap-6 text-sm font-medium text-zinc-400">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <Link href="/history" className="hover:text-white transition-colors flex items-center gap-1">
          <History className="w-4 h-4" /> History
        </Link>
        <Link href="/about" className="hover:text-white transition-colors">About</Link>
      </div>
    </nav>
  );
}
