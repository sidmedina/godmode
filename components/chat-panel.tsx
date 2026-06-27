"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, MessageSquare, Zap } from "lucide-react";
import { useJobContext } from "@/lib/job-context";
import type { ChatMessage } from "@/lib/types";

const QUICK_ACTIONS = [
  { label: "Follow-up email", msg: "Draft a follow-up email for this application" },
  { label: "Negotiate offer",  msg: "Help me negotiate this offer" },
  { label: "Status check",     msg: "What should I do next given the current status?" },
  { label: "Interview tips",   msg: "Give me targeted interview tips for this role" },
];

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: "**GodMode Career Assistant**\n\nSelect a job and ask me anything — follow-ups, email drafts, negotiation scripts, interview tips, or status strategy.\n\nOr use the quick actions below.",
};

export function ChatPanel() {
  const { selectedJob } = useJobContext();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages.filter((m) => m.id !== 'welcome'), userMsg].map((m) => ({ role: m.role, content: m.content })),
          jobContext: selectedJob,
        }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { id: Date.now().toString() + 'r', role: 'assistant', content: data.message }]);
    } catch {
      setMessages((m) => [...m, { id: 'err', role: 'assistant', content: 'Something went wrong. Try again.' }]);
    }
    setLoading(false);
  };

  return (
    <aside className="w-72 shrink-0 flex flex-col h-full" style={{ background: '#fff', borderLeft: '1px solid #e0ddd8' }}>
      {/* Header */}
      <div className="px-4 py-3 shrink-0 flex items-center gap-2" style={{ borderBottom: '1px solid #e0ddd8' }}>
        <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ background: '#1a2b3c' }}>
          <Zap size={10} style={{ color: '#fff' }} />
        </div>
        <span className="text-xs font-semibold tracking-wide" style={{ color: '#1a2b3c' }}>Career Assistant</span>
        {selectedJob && (
          <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded truncate max-w-[80px] font-semibold" style={{ background: '#e8f4ef', color: '#00853e' }} title={selectedJob.company}>
            {selectedJob.company}
          </span>
        )}
      </div>

      {/* Quick actions */}
      <div className="px-3 py-2 flex flex-wrap gap-1 shrink-0" style={{ borderBottom: '1px solid #e0ddd8' }}>
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a.label}
            onClick={() => send(a.msg)}
            className="text-[10px] px-2 py-1 rounded transition-colors"
            style={{ background: '#f4f4f2', color: '#888', border: '1px solid #e0ddd8' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#00853e'; (e.currentTarget as HTMLElement).style.color = '#00853e'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#e0ddd8'; (e.currentTarget as HTMLElement).style.color = '#888'; }}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-5 h-5 rounded shrink-0 mr-2 mt-0.5 flex items-center justify-center" style={{ background: '#f4f4f2', border: '1px solid #e0ddd8' }}>
                <MessageSquare size={9} style={{ color: '#00853e' }} />
              </div>
            )}
            <div
              className="max-w-[88%] rounded px-3 py-2 text-[11px] leading-relaxed"
              style={msg.role === 'user'
                ? { background: '#1a2b3c', color: '#d0dce8' }
                : { background: '#f4f4f2', color: '#333', border: '1px solid #e0ddd8' }}
            >
              <FormattedMessage content={msg.content} />
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-5 h-5 rounded shrink-0 mr-2 mt-0.5 flex items-center justify-center" style={{ background: '#f4f4f2', border: '1px solid #e0ddd8' }}>
              <Loader2 size={9} className="animate-spin" style={{ color: '#00853e' }} />
            </div>
            <div className="px-3 py-2 rounded text-[11px]" style={{ background: '#f4f4f2', color: '#999', border: '1px solid #e0ddd8' }}>Thinking…</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 shrink-0" style={{ borderTop: '1px solid #e0ddd8' }}>
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Ask anything…"
            rows={2}
            className="flex-1 resize-none rounded px-3 py-2 text-xs outline-none"
            style={{ background: '#f4f4f2', color: '#333', border: '1px solid #e0ddd8' }}
            onFocus={(e) => { (e.target as HTMLElement).style.borderColor = '#00853e'; }}
            onBlur={(e) => { (e.target as HTMLElement).style.borderColor = '#e0ddd8'; }}
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="flex items-center justify-center w-8 h-8 rounded shrink-0 disabled:opacity-40"
            style={{ background: '#00853e', color: '#fff' }}
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function FormattedMessage({ content }: { content: string }) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} style={{ color: '#1a2b3c' }}>{part.slice(2, -2)}</strong>;
        }
        return (
          <span key={i}>
            {part.split('\n').map((line, j, arr) => (
              <span key={j}>{line}{j < arr.length - 1 ? <br /> : null}</span>
            ))}
          </span>
        );
      })}
    </>
  );
}
