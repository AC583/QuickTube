"use client";

import Link from "next/link";
import { Video, History, Info, Sparkles } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#0D9488] rounded-xl flex items-center justify-center">
          <Video className="text-white w-5 h-5" />
        </div>
        <span className="font-bold text-xl tracking-tight text-white">QuickTube</span>
      </Link>
      
      <div className="flex items-center gap-8 text-sm font-medium">
        <Link href="/" className="text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer">
          Home
        </Link>
        <Link href="/history" className="text-zinc-400 hover:text-white transition-colors duration-200 flex items-center gap-2 cursor-pointer">
          <History className="w-4 h-4" /> History
        </Link>
        <Link href="/about" className="text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer">
          About
        </Link>
      </div>
    </nav>
  );
}