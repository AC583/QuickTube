import { Navbar } from "@/components/Navbar";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <Navbar />
      
      <div className="pt-32 px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">About QuickTube</h1>
          <p className="text-zinc-400 text-lg leading-relaxed mb-6">
            QuickTube is a cutting-edge platform designed to help you consume video content more efficiently. 
            By leveraging state-of-the-art AI from Deepgram and NVIDIA, we provide high-fidelity transcriptions and 
            structured summaries of any YouTube video.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-bold mb-4 text-white">Transcription</h3>
              <p className="text-zinc-500">
                Powered by Deepgram&apos;s Nova-2 model, providing industry-leading accuracy and speed for audio processing.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-bold mb-4 text-white">Intelligence</h3>
              <p className="text-zinc-500">
                Utilizing NVIDIA NIM with Llama 3.1 and Mixtral models for complex reasoning and contextual understanding.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
