"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoHistory {
  id: string;
  title: string;
  youtubeId: string;
  thumbnailUrl: string;
  createdAt: string;
}

export function HistoryDashboard() {
  const [history, setHistory] = useState<VideoHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setHistory(data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-video rounded-2xl bg-zinc-900 animate-pulse border border-zinc-800" />
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-20 bg-zinc-900 rounded-3xl border border-zinc-800">
        <p className="text-zinc-500">No videos processed yet. Start by pasting a URL above!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {history.map((video) => (
        <Link 
          key={video.id} 
          href={`/video/${video.id}`}
          className="group block relative aspect-video rounded-2xl overflow-hidden border border-zinc-800 hover:border-[#0D9488] transition-colors duration-200 cursor-pointer"
        >
          <img 
            src={video.thumbnailUrl} 
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-bold text-lg line-clamp-2 mb-2 group-hover:text-[#14B8A6] transition-colors">
              {video.title}
            </h3>
            <div className="flex items-center gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {new Date(video.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}