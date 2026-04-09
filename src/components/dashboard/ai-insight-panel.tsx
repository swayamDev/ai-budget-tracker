'use client';

import { useState } from 'react';
import { Brain, Sparkles, Lock, RefreshCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Transaction } from '@/types';

interface AIInsightPanelProps {
  transactions: Transaction[];
  isPro: boolean;
}

export default function AIInsightPanel({ transactions, isPro }: AIInsightPanelProps) {
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  async function fetchInsights() {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions }),
      });
      const data = await res.json();
      setInsight(data.insights ?? 'No insights available.');
      setGenerated(true);
    } catch {
      setInsight('Failed to generate insights. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass rounded-2xl p-5 md:p-6 relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/15 blur-2xl rounded-full pointer-events-none" />

      <div className="flex items-start gap-3 mb-4 relative">
        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
          <Brain className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground text-sm">AI Insights</h3>
            {isPro && (
              <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Pro
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Powered by GPT-4</p>
        </div>
      </div>

      {!isPro ? (
        <div className="text-center py-5">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
            <Lock className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Unlock personalized AI insights<br />with a Pro plan
          </p>
          <Link href="/pricing">
            <Button size="sm" className="w-full gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Upgrade to Pro
            </Button>
          </Link>
        </div>
      ) : !generated ? (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Get personalized insights on your spending patterns and savings opportunities.
          </p>
          <Button onClick={fetchInsights} disabled={loading} size="sm" className="w-full gap-1.5">
            {loading ? (
              <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing…</>
            ) : (
              <><Zap className="w-3.5 h-3.5" /> Generate Insights</>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-secondary/40 rounded-xl p-3.5">
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{insight}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchInsights}
            disabled={loading}
            className="w-full text-xs text-muted-foreground gap-1.5"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            Refresh insights
          </Button>
        </div>
      )}
    </div>
  );
}
