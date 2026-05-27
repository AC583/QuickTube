"use client";

import { useState } from "react";
import { Video, ArrowRight, Loader2, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export function VideoInput() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
      toast.error("Please enter a valid YouTube URL");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/process", {
        method: "POST",
        body: JSON.stringify({ url }),
        headers: { "Content-Type": "application/json" },
      });

      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        throw new Error(
          res.ok
            ? "Server returned an unexpected response. Restart the dev server and try again."
            : `Server error (${res.status}). Restart the dev server after running: pnpm exec prisma generate`
        );
      }

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Failed to process video");

      router.push(`/video/${data.videoId}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to process video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative flex items-center bg-zinc-900 rounded-2xl border-2 border-zinc-800 focus-within:border-[#0D9488] transition-colors duration-200">
        <div className="pl-5 text-zinc-500">
          <Video className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste YouTube video link here..."
          className="flex-1 bg-transparent py-4 px-4 focus:outline-none text-white placeholder:text-zinc-600 text-base"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !url}
          className="mr-2 bg-[#0D9488] hover:bg-[#14B8A6] text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50 disabled:hover:bg-[#0D9488] transition-colors duration-200 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Summarize <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
      <div className="flex items-center justify-center gap-2 mt-4 text-zinc-500 text-sm">
        <Zap className="w-4 h-4 text-[#F97316]" />
        <span>Powered by Deepgram & NVIDIA NIM</span>
      </div>
    </form>
  );
}