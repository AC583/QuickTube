import { Navbar } from "@/components/Navbar";
import { VideoInput } from "@/components/VideoInput";
import { HistoryDashboard } from "@/components/HistoryDashboard";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-400 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            AI-Powered Video Intelligence
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 gradient-text">
            Turn Any Video into <br /> Structured Insights
          </h1>
          <p className="text-lg text-zinc-400 mb-12 max-w-2xl mx-auto">
            Extract transcripts, generate summaries, and chat with your YouTube videos using state-of-the-art AI.
          </p>
          
          <VideoInput />
        </div>
      </section>

      {/* History / Recent Summaries */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold">Recent Summaries</h2>
          </div>
          <HistoryDashboard />
        </div>
      </section>
    </main>
  );
}
