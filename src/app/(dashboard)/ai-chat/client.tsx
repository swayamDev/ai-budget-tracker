'use client';

import { useState, useRef, useEffect, useId } from 'react';
import { Send, Bot, User, Sparkles, Lock, Brain, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import type { ChatMessage } from '@/types';

const SUGGESTIONS = [
  'How can I reduce my expenses?',
  "What's my biggest spending category?",
  'How should I build an emergency fund?',
  'Tips to reach my savings goals faster',
];

interface AIChatClientProps {
  isPro: boolean;
  financialContext: {
    income: number;
    expense: number;
    balance: number;
    recentTransactions: Array<{ type: string; amount: number; category: string }>;
  };
}

function generateId(): string {
  // crypto.randomUUID is available in all modern browsers and Node 19+
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function AIChatClient({ isPro, financialContext }: AIChatClientProps) {
  const chatInputId = useId();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'initial-assistant',
      role: 'assistant',
      content:
        "Hi! I'm your personal AI financial advisor. I have access to your financial data and I'm here to help you make smarter money decisions. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text?: string) {
    const msg = text ?? input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: msg,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, context: financialContext }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'assistant',
          content: data.reply ?? 'Sorry, I could not process that.',
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      // Restore focus to input after response
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  if (!isPro) {
    return (
      <div className="flex flex-col items-center justify-center animate-fade-in">
        <div className="glass rounded-3xl p-12 text-center max-w-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" aria-hidden="true" />
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <Brain className="w-8 h-8 text-primary" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold mb-3">AI Financial Advisor</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Chat with your personal AI financial advisor. Get tailored advice based on your actual
            spending data, savings goals, and financial habits.
          </p>
          <ul className="space-y-2 mb-8 text-left" aria-label="Pro features">
            {[
              { icon: Sparkles,   text: 'Personalized financial advice' },
              { icon: TrendingUp, text: 'Spending pattern analysis' },
              { icon: Zap,        text: 'Instant answers to money questions' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm">
                <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
                <span className="text-muted-foreground">{text}</span>
              </li>
            ))}
          </ul>
          <Link href="/pricing">
            <Button className="w-full shadow-glow">
              <Lock className="w-4 h-4 mr-2" aria-hidden="true" />
              Upgrade to Pro to Unlock
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] animate-fade-in">
      {/* Chat header */}
      <div className="glass rounded-2xl p-4 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center" aria-hidden="true">
          <Brain className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold">AI Financial Advisor</h2>
          <p className="text-xs text-muted-foreground">
            Powered by GPT-4 • Has access to your financial data
          </p>
        </div>
        <span
          className="ml-auto text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-medium"
          aria-label="Advisor is online"
        >
          Online
        </span>
      </div>

      {/* Message list */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div
                className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5"
                aria-hidden="true"
              >
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'glass rounded-bl-sm text-foreground'
              }`}
              aria-label={`${msg.role === 'user' ? 'You' : 'Assistant'}: ${msg.content}`}
            >
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div
                className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5"
                aria-hidden="true"
              >
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start" aria-live="polite" aria-label="Assistant is typing">
            <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary" aria-hidden="true" />
            </div>
            <div className="glass rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} aria-hidden="true" />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="mb-3 flex flex-wrap gap-2" aria-label="Suggested questions">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => sendMessage(s)}
              className="text-xs px-3 py-1.5 rounded-full bg-secondary/60 hover:bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="glass rounded-2xl p-3 flex items-center gap-3">
        <label htmlFor={chatInputId} className="sr-only">
          Message the AI advisor
        </label>
        <Input
          id={chatInputId}
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your finances…"
          className="flex-1 bg-transparent border-0 shadow-none focus-visible:ring-0 text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          disabled={loading}
          aria-disabled={loading}
        />
        <Button
          type="button"
          size="icon"
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          aria-label="Send message"
          className="shrink-0"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
