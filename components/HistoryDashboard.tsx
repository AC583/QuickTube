"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Trash2, X } from "lucide-react";

interface VideoHistory {
  id: string;
  title: string;
  youtubeId: string;
  thumbnailUrl: string;
  createdAt: string;
}

function DeleteConfirmModal({
  videoTitle,
  onConfirm,
  onCancel,
}: {
  videoTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Delete Summary</h3>
          <button onClick={onCancel} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-zinc-400 mb-6">
          Are you sure you want to delete{" "}
          <span className="text-white font-medium">&ldquo;{videoTitle}&rdquo;</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function HistoryDashboard() {
  const [history, setHistory] = useState<VideoHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/history")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setHistory(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(`/api/history?id=${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setHistory((prev) => prev.filter((v) => v.id !== deleteId));
      }
    } catch (error) {
      console.error("Failed to delete video:", error);
    } finally {
      setDeleteId(null);
    }
  };

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
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((video) => (
          <div key={video.id} className="group relative">
            <Link
              href={`/video/${video.id}`}
              className="block aspect-video rounded-2xl overflow-hidden border border-zinc-800 hover:border-[#0D9488] transition-colors duration-200 cursor-pointer"
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
            <button
              onClick={(e) => {
                e.preventDefault();
                handleDelete(video.id);
              }}
              className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {deleteId && (
        <DeleteConfirmModal
          videoTitle={history.find((v) => v.id === deleteId)?.title || ""}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </>
  );
}