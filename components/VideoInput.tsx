"use client";

import { useState } from "react";
import { Video, ArrowRight, Loader2 } from "lucide-react";
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

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      router.push(`/video/${data.videoId}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to process video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-white transition-colors">
          <Video className="w-6 h-6" />
        </div>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste YouTube video link here..."
          className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-4 pl-14 pr-32 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all text-lg placeholder:text-zinc-600"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !url}
          className="absolute right-2 top-2 bottom-2 bg-white text-black px-6 rounded-xl font-semibold flex items-center gap-2 hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-white transition-all"
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
      <p className="text-zinc-500 text-sm mt-4 text-center">
        Powered by Deepgram & NVIDIA NIM
      </p>
    </form>
  );
}
