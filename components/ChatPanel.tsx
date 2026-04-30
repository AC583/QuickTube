"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatPanel({ videoId }: { videoId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input || loading) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          videoId,
          message: userMessage,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <Bot className="w-12 h-12 text-zinc-700 mb-4" />
            <p className="text-zinc-500 text-sm">
              Ask me anything about the video. I&apos;ve analyzed the entire transcript!
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <div 
            key={i} 
            className={cn(
              "flex flex-col max-w-[85%] rounded-2xl p-4 text-sm",
              m.role === "user" 
                ? "ml-auto bg-white text-black" 
                : "mr-auto bg-white/5 border border-white/10 text-zinc-300"
            )}
          >
            <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-wider opacity-50">
              {m.role === "user" ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
              {m.role}
            </div>
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="mr-auto bg-white/5 border border-white/10 text-zinc-300 rounded-2xl p-4 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs italic">Thinking...</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all text-sm"
        />
        <button
          type="submit"
          disabled={!input || loading}
          className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-white text-black rounded-lg hover:bg-zinc-200 disabled:opacity-50 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
