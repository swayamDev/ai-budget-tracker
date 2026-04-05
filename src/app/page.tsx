import Link from 'next/link';
import { ArrowRight, BarChart3, Brain, Shield, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const user = await currentUser();
  if (user) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">Fintrak AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <Link href="/sign-in" className="hover:text-foreground transition-colors">Sign in</Link>
          </div>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 text-center">
        {/* Glow effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-accent/10 blur-[100px] rounded-full" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium mb-8">
            <Sparkles className="w-3 h-3" />
            AI-Powered Financial Intelligence
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Manage Money
            <span className="block text-gradient">Smarter with AI</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Track income, expenses, and reach your financial goals with personalized AI insights that actually help you save more.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-all hover:shadow-glow"
            >
              Start for Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-border text-foreground font-semibold text-lg hover:bg-secondary/50 transition-all"
            >
              Sign In
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Free forever • No credit card required</p>
        </div>

        {/* Dashboard preview */}
        <div className="relative mt-20 max-w-5xl mx-auto">
          <div className="glass rounded-2xl p-2 shadow-soft">
            <div className="bg-card rounded-xl overflow-hidden">
              {/* Mock dashboard */}
              <div className="bg-sidebar p-4 flex items-center gap-3 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-accent/60" />
                </div>
                <div className="flex-1 h-5 bg-secondary rounded-md" />
              </div>
              <div className="p-6 grid grid-cols-4 gap-4">
                {[
                  { label: 'Balance', value: '$12,450', color: 'text-foreground', change: '+8.2%' },
                  { label: 'Income', value: '$8,200', color: 'text-accent', change: '+12%' },
                  { label: 'Expenses', value: '$3,840', color: 'text-destructive', change: '-5%' },
                  { label: 'Savings', value: '$4,360', color: 'text-primary', change: '+18%' },
                ].map((stat) => (
                  <div key={stat.label} className="glass rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                    <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-accent mt-1">{stat.change}</p>
                  </div>
                ))}
              </div>
              <div className="px-6 pb-6 grid grid-cols-3 gap-4">
                <div className="col-span-2 glass rounded-xl p-4 h-36 flex items-end gap-1">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                    <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i % 3 === 0 ? 'hsl(var(--primary))' : 'hsl(var(--primary)/0.3)' }} />
                  ))}
                </div>
                <div className="glass rounded-xl p-4 flex flex-col gap-2">
                  {['Food', 'Transport', 'Shopping'].map((cat, i) => (
                    <div key={cat} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--warning))'][i] }} />
                      <span className="text-xs text-muted-foreground">{cat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Glow under preview */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-primary/20 blur-3xl" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything you need to</h2>
            <p className="text-4xl font-bold text-gradient">master your finances</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: 'AI Financial Insights',
                desc: 'Get personalized insights based on your spending patterns. AI analyzes your data to help you save more.',
                color: 'text-primary',
                bg: 'bg-primary/10',
              },
              {
                icon: BarChart3,
                title: 'Visual Analytics',
                desc: 'Beautiful charts and graphs show exactly where your money goes with monthly trends and breakdowns.',
                color: 'text-accent',
                bg: 'bg-accent/10',
              },
              {
                icon: TrendingUp,
                title: 'Goal Tracking',
                desc: 'Set savings goals and track progress with visual progress bars. Achieve financial milestones faster.',
                color: 'text-warning',
                bg: 'bg-warning/10',
              },
              {
                icon: Shield,
                title: 'Budget Management',
                desc: 'Set category budgets and get alerts before you overspend. Stay in control of every dollar.',
                color: 'text-destructive',
                bg: 'bg-destructive/10',
              },
              {
                icon: Zap,
                title: 'Auto Categorization',
                desc: 'AI automatically categorizes your transactions so you never have to do it manually again.',
                color: 'text-primary',
                bg: 'bg-primary/10',
              },
              {
                icon: Sparkles,
                title: 'AI Chat Assistant',
                desc: 'Ask your financial advisor anything. Get instant answers about your spending and savings.',
                color: 'text-accent',
                bg: 'bg-accent/10',
              },
            ].map((feature) => (
              <div key={feature.title} className="glass glass-hover rounded-2xl p-6 group">
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-muted-foreground mb-16">Start free, upgrade when you need more power</p>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free */}
            <div className="glass rounded-2xl p-8 text-left">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <p className="text-muted-foreground mb-6">Perfect to get started</p>
              <div className="text-5xl font-bold mb-8">$0<span className="text-lg text-muted-foreground font-normal">/mo</span></div>
              <ul className="space-y-3 mb-8">
                {['50 transactions/month', 'Basic dashboard', '2 budgets', '2 savings goals', 'Basic AI insights'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up" className="block w-full text-center py-3 rounded-xl border border-border hover:bg-secondary/50 transition-colors font-medium">
                Get Started Free
              </Link>
            </div>
            {/* Pro */}
            <div className="rounded-2xl p-8 text-left bg-primary/10 border border-primary/30 relative overflow-hidden">
              <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">Popular</div>
              <div className="absolute inset-0 bg-glow-primary opacity-30 pointer-events-none" />
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <p className="text-muted-foreground mb-6">For serious savers</p>
              <div className="text-5xl font-bold mb-8">$9.99<span className="text-lg text-muted-foreground font-normal">/mo</span></div>
              <ul className="space-y-3 mb-8">
                {['Unlimited transactions', 'Advanced AI insights', 'Unlimited budgets & goals', 'AI chat assistant', 'Spending predictions', 'Auto-categorization', 'Export reports'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up" className="block w-full text-center py-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium shadow-glow">
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to transform your finances?</h2>
          <p className="text-muted-foreground mb-8">Join thousands of users who've taken control of their money with Fintrak AI.</p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-all hover:shadow-glow"
          >
            Start for Free Today <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold">Fintrak AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Fintrak AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
