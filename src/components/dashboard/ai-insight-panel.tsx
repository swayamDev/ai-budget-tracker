'use client';

import { useState } from 'react';
import { Brain, Sparkles, Lock, RefreshCw } from 'lucide-react';
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
    <div className="glass rounded-2xl p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full pointer-events-none" />

      <div className="flex items-center gap-2 mb-4 relative">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Brain className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">AI Insights</h3>
          <p className="text-xs text-muted-foreground">Powered by GPT-4</p>
        </div>
        {isPro && (
          <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
            PRO
          </span>
        )}
      </div>

      {!isPro ? (
        <div className="text-center py-4">
          <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-3">Upgrade to Pro for unlimited AI insights</p>
          <Link href="/pricing">
            <Button size="sm" className="w-full">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Upgrade to Pro
            </Button>
          </Link>
        </div>
      ) : !generated ? (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Get AI-powered insights about your spending patterns and savings opportunities.
          </p>
          <Button onClick={fetchInsights} disabled={loading} size="sm" className="w-full">
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Generate Insights
              </>
            )}
          </Button>
        </div>
      ) : (
        <div>
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{insight}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchInsights}
            disabled={loading}
            className="mt-3 w-full text-xs text-muted-foreground"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      )}
    </div>
  );
}
