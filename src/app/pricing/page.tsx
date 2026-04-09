'use client';

import { useState } from 'react';
import { Check, Sparkles, Zap, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const FREE_FEATURES = [
  '50 transactions per month',
  'Basic income & expense tracking',
  '2 budget categories',
  '2 savings goals',
  'Basic dashboard',
  '3 AI insights per month',
];

const PRO_FEATURES = [
  'Unlimited transactions',
  'Advanced AI financial insights',
  'Unlimited budget categories',
  'Unlimited savings goals',
  'AI chat financial advisor',
  'Auto-categorization with AI',
  'Spending predictions',
  'CSV export',
  'Priority support',
];

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background py-20 px-6">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto relative">
        {/* Back */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium mb-6">
            <Sparkles className="w-3 h-3" /> Simple Pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose your plan
          </h1>
          <p className="text-xl text-muted-foreground">
            Start free, upgrade when you need more power
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free */}
          <div className="glass rounded-2xl p-8 flex flex-col">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-1">Free</h2>
              <p className="text-muted-foreground text-sm">Perfect to get started</p>
            </div>
            <div className="mb-8">
              <span className="text-5xl font-bold">$0</span>
              <span className="text-muted-foreground ml-2">/ month</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
            <Link href="/sign-up">
              <Button variant="outline" className="w-full">Get Started Free</Button>
            </Link>
          </div>

          {/* Pro */}
          <div className="rounded-2xl p-8 flex flex-col relative overflow-hidden border border-primary/40 bg-primary/8">
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-radial from-primary/15 to-transparent pointer-events-none" />
            {/* Badge */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              <Zap className="w-3 h-3" /> Most Popular
            </div>

            <div className="relative mb-6">
              <h2 className="text-xl font-bold mb-1">Pro</h2>
              <p className="text-muted-foreground text-sm">For serious savers</p>
            </div>
            <div className="relative mb-8">
              <span className="text-5xl font-bold">$9.99</span>
              <span className="text-muted-foreground ml-2">/ month</span>
            </div>
            <ul className="relative space-y-3 mb-8 flex-1">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-primary/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground">{f}</span>
                </li>
              ))}
            </ul>
            <Button
              className="relative w-full shadow-glow"
              onClick={handleUpgrade}
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing…</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" />Upgrade to Pro</>
              )}
            </Button>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your Pro subscription at any time. You\'ll keep access until the end of your billing period.' },
              { q: 'Is my financial data secure?', a: 'Absolutely. All data is encrypted and stored securely. We never share your data with third parties.' },
              { q: 'What payment methods are accepted?', a: 'We accept all major credit and debit cards through Stripe, our secure payment processor.' },
              { q: 'Can I upgrade or downgrade?', a: 'Yes, you can upgrade to Pro anytime. Downgrading to Free takes effect at the end of your billing cycle.' },
            ].map(({ q, a }) => (
              <div key={q} className="glass rounded-xl p-5">
                <p className="font-semibold text-sm mb-2">{q}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
