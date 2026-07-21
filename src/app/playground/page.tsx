"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { PageHeader } from "@/components/ui";
import { Send } from "lucide-react";
import { SUPPORTED_MODELS } from "@/lib/openrouter";
import type { ChatMessage } from "@/types";

export default function PlaygroundPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState<string>(SUPPORTED_MODELS[0].id);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "system", content: "You are a helpful AI assistant." }, ...newMessages],
          model,
        }),
      });
      const data = await res.json();

      if (data.message) {
        setMessages([...newMessages, { role: "assistant", content: data.message.content }]);
      } else {
        setMessages([...newMessages, { role: "assistant", content: `Error: ${data.error || "Unknown error"}` }]);
      }
    } catch (err: any) {
      setMessages([...newMessages, { role: "assistant", content: `Network error: ${err.message}` }]);
    }
    setLoading(false);
  }, [input, model, messages, loading]);

  const modelName = SUPPORTED_MODELS.find(m => m.id === model)?.name || model;

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <div className="flex items-center justify-between mb-4">
        <PageHeader title="Playground" subtitle="Test models via OpenRouter API" />
        <div className="flex items-center gap-3">
          <select value={model} onChange={e => setModel(e.target.value)} className="bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white outline-none">
            {SUPPORTED_MODELS.map(m => <option key={m.id} value={m.id} className="bg-gray-900">{m.name} ({m.provider})</option>)}
          </select>
          <span className="px-3 py-2 text-xs text-gray-500">Provider key is server-managed</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 mb-4 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="flex items-center justify-center h-full text-gray-600 text-sm">
            Send a message to start chatting with {modelName}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${m.role === "user"
              ? "bg-cyan-600/20 text-cyan-100 border border-cyan-500/20"
              : "bg-white/[0.05] text-gray-300 border border-white/[0.06]"}`}>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-medium">{m.role}</div>
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/[0.05] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-gray-500 animate-pulse">
              Generating...
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-cyan-500/50 transition-colors" />
        <button onClick={sendMessage} disabled={loading}
          className="px-4 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl transition-colors flex items-center gap-2">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
