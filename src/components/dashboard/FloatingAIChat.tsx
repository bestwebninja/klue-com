/**
 * FloatingAIChat — Fixed floating chat widget for the GC dashboard.
 *
 * Collapsed: round button bottom-right.
 * Expanded: chat panel with message history, auto-suggest prompts, and typing indicator.
 * Simulates AI responses with a 1–2 second delay for demo purposes.
 */

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, ChevronDown, Mic, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

const SUGGEST_PROMPTS = [
  'Summarize today\'s job schedule',
  'What permits are expiring soon?',
  'Which invoices are overdue?',
  'Draft a follow-up email for my latest quote',
  'What\'s the weather risk for this week?',
  'Show me my crew utilization',
];

const CANNED_RESPONSES: Record<string, string> = {
  schedule: 'You have 6 jobs scheduled this week. Crew A is at Maple St for concrete (Mon 7 AM), Crew B at Pine Dr for plumbing (Thu 7 AM), and Crew C is handling the Oak Rd electrical panel (Wed 8 AM). No scheduling conflicts detected.',
  permit: 'You have 1 permit expiring within 90 days: Cedar Lane roofing permit (RP-2023-09941) expires 2024-05-10. 1 permit is under review (Pine Drive plumbing). Recommend scheduling the Cedar Lane final inspection this week.',
  invoice: 'You have 2 overdue invoices totaling $18,400. Invoice #1043 to Harrington Developers has been outstanding 32 days. Invoice #1051 to Santos Properties has been outstanding 14 days. I can draft reminder emails if you\'d like.',
  follow: 'Here\'s a draft follow-up email:\n\nSubject: Following up on your estimate\n\nHi [Client Name],\n\nI wanted to follow up on the estimate we sent last week. We\'re happy to walk through any questions you may have about scope, timeline, or pricing. Let us know when you\'d like to connect!\n\nBest,\n[Your Name]',
  weather: 'Current weather risk: MODERATE. Rain expected Wednesday (possible concrete pour delay for Pine Dr). Wind 18 mph Thursday — monitor for scaffolding advisory. Temperature through the week is 52–68°F — safe for most exterior work.',
  crew: 'Crew utilization this week: Crew A 31/40 hrs (78%), Crew B 20/40 hrs (50%), Crew C 24/40 hrs (60%), Crew D 18/40 hrs (45%). Crew B has capacity — consider assigning them to the Cedar Ln punch list.',
  default: 'I\'m your GC Command AI. I can help you track jobs, permits, invoices, crew scheduling, weather risk, and more. Ask me anything about your project portfolio!',
};

function getAiResponse(input: string): string {
  const t = input.toLowerCase();
  if (t.includes('schedule') || t.includes('job')) return CANNED_RESPONSES.schedule;
  if (t.includes('permit')) return CANNED_RESPONSES.permit;
  if (t.includes('invoice') || t.includes('overdue') || t.includes('payment')) return CANNED_RESPONSES.invoice;
  if (t.includes('follow') || t.includes('email') || t.includes('quote')) return CANNED_RESPONSES.follow;
  if (t.includes('weather') || t.includes('rain') || t.includes('wind')) return CANNED_RESPONSES.weather;
  if (t.includes('crew') || t.includes('utilization') || t.includes('labor')) return CANNED_RESPONSES.crew;
  return CANNED_RESPONSES.default;
}

export function FloatingAIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      text: 'Hi! I\'m your GC Command AI. Ask me about your schedule, permits, invoices, crew, or weather risk.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  function sendMessage(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    const delay = 800 + Math.random() * 800;
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: getAiResponse(msg),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, reply]);
      setTyping(false);
    }, delay);
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full bg-amber-400 text-slate-900 shadow-lg shadow-amber-400/30 flex items-center justify-center hover:bg-amber-300 transition-all hover:scale-105 active:scale-95"
          aria-label="Open AI assistant"
        >
          <Bot className="w-5 h-5" />
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[340px] max-w-[calc(100vw-24px)] rounded-2xl shadow-2xl shadow-slate-950/40 border border-amber-300/30 overflow-hidden flex flex-col bg-[#07182f]">
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 bg-[#081f3b] border-b border-amber-300/20">
            <div className="w-7 h-7 rounded-full bg-amber-400/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-100">GC Command AI</div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                Online
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="ml-auto text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[340px] min-h-[200px]">
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                    <Bot className="w-3 h-3 text-amber-300" />
                  </div>
                )}
                <div className={`max-w-[82%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-line ${
                  m.role === 'user'
                    ? 'bg-amber-400 text-slate-900 rounded-tr-sm'
                    : 'bg-[#0d294f] text-slate-200 border border-amber-300/15 rounded-tl-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                  <Bot className="w-3 h-3 text-amber-300" />
                </div>
                <div className="bg-[#0d294f] border border-amber-300/15 rounded-xl rounded-tl-sm px-3 py-2.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggest chips */}
          <div className="px-3 pb-1.5 flex gap-1.5 overflow-x-auto scrollbar-thin">
            {SUGGEST_PROMPTS.slice(0, 3).map(p => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                className="shrink-0 text-[10px] px-2.5 py-1 rounded-full border border-amber-300/30 text-amber-200 bg-[#0a2344] hover:bg-amber-300/10 transition-colors whitespace-nowrap"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 p-3 pt-1.5 border-t border-amber-300/20">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask your AI…"
              className="flex-1 h-8 text-xs bg-[#0d294f] border-amber-300/25 text-slate-100 placeholder:text-slate-400"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || typing}
              className="w-8 h-8 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center hover:bg-amber-300 disabled:opacity-40 transition-all shrink-0"
            >
              {typing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
