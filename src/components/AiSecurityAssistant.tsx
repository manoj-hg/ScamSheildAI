import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, X, Bot, User, Loader2 } from 'lucide-react';
import { ScanResult } from '../types';
import { askAssistant } from '../services/api';

interface AiSecurityAssistantProps {
  scanResult: ScanResult | null;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  "Why is this suspicious?",
  "What is the biggest red flag?",
  "Should I contact the recruiter?",
  "Is the payment request dangerous?",
];

export const AiSecurityAssistant: React.FC<AiSecurityAssistantProps> = ({
  scanResult,
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: scanResult
        ? `Hello! I'm your ScamShield Security Assistant. I've reviewed Incident #${scanResult.scan_id} (${scanResult.threat_score}/100 - ${scanResult.risk_level} RISK). Ask me any questions about the detected red flags, payment risks, or how to protect yourself.`
        : "Hello! I'm your ScamShield Security Assistant. Run a scan or ask me general questions about job and rental fraud techniques.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const scanContext = scanResult
        ? {
            threat_score: scanResult.threat_score,
            risk_level: scanResult.risk_level,
            scam_types: scanResult.scam_types,
            red_flags: scanResult.red_flags.map((rf) => ({ label: rf.label, explanation: rf.explanation })),
            company_verification: scanResult.company_verification,
            entities: scanResult.extracted_entities,
          }
        : {};

      const responseText = await askAssistant(query, scanContext);
      setMessages((prev) => [...prev, { role: 'assistant', content: responseText }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Unable to reach security reasoning service. Please check network connection.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-[88dvh] sm:h-[600px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>ScamShield Security Advisor</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  AI Grounded
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                {scanResult ? `Incident Context: #${scanResult.scan_id}` : 'General Cyber Advisor'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center"
            title="Close Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Message Stream */}
        <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2 sm:gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[85%] sm:max-w-[82%] p-3 rounded-xl text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-cyan-500 text-slate-950 font-medium'
                    : 'bg-slate-900 border border-slate-800 text-slate-200'
                }`}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Analyzing threat context with Gemini...</span>
            </div>
          )}
        </div>

        {/* Quick Question Chips */}
        <div className="p-2 px-3 border-t border-slate-800/80 bg-slate-900/40 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap transition-all touch-manipulation min-h-[32px]"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-2.5 sm:p-3 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question about this offer letter or listing..."
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-slate-100 placeholder-slate-500 outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold transition-all min-w-[42px] min-h-[42px] flex items-center justify-center touch-manipulation"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
