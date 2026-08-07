import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Sparkles, User as UserIcon, Minimize2, MessageSquare, ShieldCheck, Zap } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

const PRESET_QUESTIONS = [
  "What ROI do your investment plans pay?",
  "How do I deposit USDT / Crypto?",
  "How does the Insurance Aegis shield work?",
  "Is KYC mandatory for withdrawals?",
];

export function GroqAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg_welcome",
      sender: "assistant",
      text: "👋 Welcome to Invest Different AI Support! I'm your institutional portfolio assistant. How can I help you accelerate your yield today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: "usr_" + Date.now(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      const data = await res.json();
      const assistantMsg: Message = {
        id: "ai_" + Date.now(),
        sender: "assistant",
        text: data.reply || "Thank you for reaching out. Our support team is always available if you need further institutional assistance.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: "err_" + Date.now(),
          sender: "assistant",
          text: "⚡ Invest Different AI Engine: All automated plans earn daily yield paid directly to your wallet. You can request withdrawals at any time once minimum threshold ($50) is reached.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 rounded-full gold-gradient p-3.5 text-slate-950 font-bold shadow-2xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <div className="relative">
            <Bot className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <span className="hidden sm:inline pr-1 text-xs uppercase tracking-widest font-black">
            AI Portfolio Advisor
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="flex flex-col w-[350px] sm:w-[400px] h-[520px] bg-slate-950/95 border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-500/10 backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gold-gradient text-slate-950 shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-white tracking-wide uppercase">
                  Invest Different AI
                </h3>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Groq v4 Knowledge Core Active
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white transition rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-amber-500 text-slate-950 font-medium rounded-tr-none"
                      : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none"
                  }`}
                >
                  <p>{m.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      m.sender === "user" ? "text-slate-900/70" : "text-slate-500"
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-xs text-amber-400">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 border border-amber-500/30">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <span className="italic text-slate-400">AI is thinking...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Questions */}
          <div className="px-3 py-2 bg-slate-900/40 border-t border-slate-800/60 overflow-x-auto flex gap-1.5 scrollbar-none">
            {PRESET_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="shrink-0 text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-amber-300 px-2.5 py-1 rounded-lg transition"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-slate-800 bg-slate-950">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about yield, deposits, insurance..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-xl gold-gradient text-slate-950 font-bold disabled:opacity-50 hover:scale-105 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
