import { Navbar } from "@/components/Navbar";
import { HistoryDashboard } from "@/components/HistoryDashboard";

export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <Navbar />
      
      <div className="pt-32 px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-10">Video History</h1>
          <HistoryDashboard />
        </div>
      </div>
    </main>
  );
}
