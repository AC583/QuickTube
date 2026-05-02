"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";

const STEPS = [
  { status: "PENDING", label: "Queued" },
  { status: "PROCESSING", label: "Transcribing & summarizing" },
  { status: "COMPLETED", label: "Done" },
];

export function ProcessingStatus({
  videoId,
  status: initialStatus,
  error: initialError,
}: {
  videoId: string;
  status: string;
  error?: string | null;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState(initialError);
  const router = useRouter();

  useEffect(() => {
    if (status === "COMPLETED" || status === "FAILED") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/status/${videoId}`);
        const data = await res.json();
        setStatus(data.status);
        setError(data.error);
        if (data.status === "COMPLETED") {
          router.refresh();
        }
      } catch {
        // ignore transient fetch errors, keep polling
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [status, videoId, router]);

  if (status === "FAILED") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6">
        <AlertCircle className="w-14 h-14 text-red-500" />
        <h2 className="text-2xl font-bold">Processing Failed</h2>
        <p className="text-zinc-400 text-center max-w-md">
          {error || "An error occurred while processing the video."}
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 px-5 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#14B8A6] text-white font-semibold transition-colors"
        >
          Try another video
        </button>
      </div>
    );
  }

  const currentStep = STEPS.findIndex((s) => s.status === status);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-6">
      <Loader2 className="w-14 h-14 text-[#0D9488] animate-spin" />
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Processing Video</h2>
        <p className="text-zinc-400">
          {status === "PENDING" ? "Starting up…" : "Transcribing and summarizing…"}
        </p>
        <p className="text-zinc-600 text-sm mt-2">Long videos may take several minutes.</p>
      </div>

      <div className="flex items-center gap-3">
        {STEPS.slice(0, 2).map((step, i) => (
          <div key={step.status} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full transition-colors ${
                  i <= currentStep ? "bg-[#0D9488]" : "bg-zinc-700"
                }`}
              />
              <span
                className={`text-sm ${i <= currentStep ? "text-[#14B8A6]" : "text-zinc-600"}`}
              >
                {step.label}
              </span>
            </div>
            {i < 1 && <div className="w-8 h-px bg-zinc-700" />}
          </div>
        ))}
      </div>
    </div>
  );
}
