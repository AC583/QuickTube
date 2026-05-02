import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { SummaryDisplay } from "@/components/SummaryDisplay";
import { TimestampList } from "@/components/TimestampList";
import { ChatPanel } from "@/components/ChatPanel";
import { ExportButtons } from "@/components/ExportButtons";
import { ProcessingStatus } from "@/components/ProcessingStatus";
import { notFound } from "next/navigation";
import { Share2 } from "lucide-react";

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const video = await prisma.video.findUnique({
    where: { id },
  });

  if (!video) {
    notFound();
  }

  if (video.status !== "COMPLETED") {
    return (
      <main className="min-h-screen bg-[#09090b] text-white">
        <Navbar />
        <ProcessingStatus
          videoId={id}
          status={video.status}
          error={video.errorMessage}
        />
      </main>
    );
  }

  const highlights = JSON.parse(video.highlights!);

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <Navbar />

      <div className="pt-24 px-6 pb-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content (Summary) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="aspect-video rounded-3xl overflow-hidden border border-white/10 bg-zinc-900">
              <iframe
                src={`https://www.youtube.com/embed/${video.youtubeId}`}
                className="w-full h-full"
                allowFullScreen
              />
            </div>

            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">{video.title}</h1>
              <div className="flex gap-2">
                <ExportButtons
                  title={video.title}
                  summary={video.summary!}
                  highlights={highlights}
                />
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            </div>

            <div className="glass rounded-3xl p-8 border border-white/10">
              <SummaryDisplay content={video.summary!} />
            </div>
          </div>

          {/* Sidebar (Timestamps & Chat) */}
          <div className="space-y-8">
            <div className="glass rounded-3xl p-6 border border-white/10 h-fit max-h-[500px] overflow-y-auto">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                Key Moments
              </h2>
              <TimestampList highlights={highlights} videoId={video.youtubeId} />
            </div>

            <div className="glass rounded-3xl p-6 border border-white/10 h-[600px] flex flex-col">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                Chat with Video
              </h2>
              <ChatPanel videoId={video.id} />
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
