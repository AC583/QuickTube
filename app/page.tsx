import { Navbar } from "@/components/Navbar";
import { VideoInput } from "@/components/VideoInput";
import { HistoryDashboard } from "@/components/HistoryDashboard";
import { Zap, FileText, MessageSquare, Download, Clock, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0D9488]/10 border border-[#0D9488]/20 text-sm font-medium text-[#14B8A6] mb-8">
            <Sparkles className="w-4 h-4" />
            AI-Powered Video Intelligence
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 gradient-text">
            Turn Any Video into <br /> Structured Insights
          </h1>
          <p className="text-lg text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Extract transcripts, generate summaries, and chat with your YouTube videos using state-of-the-art AI. Get actionable insights in seconds.
          </p>
          
          <VideoInput />
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 hover:border-[#0D9488]/50 transition-colors duration-200 cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-[#0D9488]/10 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-[#0D9488]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Auto Transcripts</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Full transcripts extracted with Deepgram's industry-leading speech recognition.
              </p>
            </div>
            
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 hover:border-[#0D9488]/50 transition-colors duration-200 cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-[#0D9488]/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-[#0D9488]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Summaries</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                AI-generated summaries highlighting key points and actionable insights instantly.
              </p>
            </div>
            
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 hover:border-[#0D9488]/50 transition-colors duration-200 cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-[#0D9488]/10 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-[#0D9488]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Chat with Video</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Ask questions and get answers about any video content in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* History / Recent Summaries */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-zinc-500" />
              <h2 className="text-2xl font-bold">Recent Summaries</h2>
            </div>
          </div>
          <HistoryDashboard />
        </div>
      </section>
    </main>
  );
}