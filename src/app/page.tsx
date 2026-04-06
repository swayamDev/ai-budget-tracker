import Link from 'next/link';
import { ArrowRight, BarChart3, Brain, Shield, Sparkles, TrendingUp, Zap, CheckCircle } from 'lucide-react';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const user = await currentUser();
  if (user) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">

      {/* ── Navigation ────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-glow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              Fintrak AI
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <Link href="/sign-in" className="hover:text-foreground transition-colors">Sign in</Link>
          </div>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-glow-sm"
          >
            Get Started <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative pt-36 pb-24 px-5 text-center">
        {/* Background glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/18 blur-[120px] rounded-full" />
          <div className="absolute top-1/2 left-1/4 w-[280px] h-[280px] bg-accent/10 blur-[100px] rounded-full" />
          <div className="absolute top-1/4 right-1/5 w-[200px] h-[200px] bg-primary/8 blur-[80px] rounded-full" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold mb-8 animate-fade-in">
            <Sparkles className="w-3 h-3" />
            AI-Powered Financial Intelligence
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] mb-6 animate-fade-in" style={{ animationDelay: '60ms' }}>
            Manage Money
            <br />
            <span className="text-gradient">Smarter with AI</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in" style={{ animationDelay: '120ms' }}>
            Track income, expenses, and reach your financial goals with
            personalized AI insights that actually help you save more.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: '180ms' }}>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-all hover:shadow-glow w-full sm:w-auto justify-center"
            >
              Start for Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-border text-foreground font-semibold text-base hover:bg-secondary/50 transition-all w-full sm:w-auto justify-center"
            >
              Sign In
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: '240ms' }}>
            Free forever • No credit card required
          </p>
        </div>

        {/* Dashboard preview mockup */}
        <div className="relative mt-20 max-w-5xl mx-auto animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="glass rounded-2xl p-1.5 shadow-soft">
            <div className="bg-card rounded-xl overflow-hidden">
              {/* Window bar */}
              <div className="bg-secondary/50 px-4 py-3 flex items-center gap-3 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-accent/60" />
                </div>
                <div className="flex-1 h-4 bg-secondary rounded max-w-xs mx-auto" />
              </div>
              {/* Stat cards row */}
              <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Net Balance', value: '$12,450', color: 'text-foreground', tag: '+8.2%', tagColor: 'text-accent bg-accent/10' },
                  { label: 'Monthly Income', value: '$8,200', color: 'text-accent', tag: '+12%', tagColor: 'text-accent bg-accent/10' },
                  { label: 'Expenses', value: '$3,840', color: 'text-destructive', tag: '-5%', tagColor: 'text-accent bg-accent/10' },
                  { label: 'Savings Rate', value: '53.2%', color: 'text-primary', tag: '+18%', tagColor: 'text-accent bg-accent/10' },
                ].map((stat) => (
                  <div key={stat.label} className="glass rounded-xl p-3 text-left">
                    <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">{stat.label}</p>
                    <p className={`text-lg font-bold ${stat.color} tabular`}>{stat.value}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${stat.tagColor}`}>{stat.tag}</span>
                  </div>
                ))}
              </div>
              {/* Chart preview */}
              <div className="px-5 pb-5 grid grid-cols-3 gap-3">
                <div className="col-span-2 glass rounded-xl p-4 h-28 flex items-end gap-1">
                  {[35, 60, 42, 78, 52, 88, 67, 82, 58, 92, 72, 85].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm transition-all"
                      style={{
                        height: `${h}%`,
                        background: i % 2 === 0
                          ? 'hsl(var(--primary))'
                          : 'hsl(var(--primary)/0.25)',
                      }}
                    />
                  ))}
                </div>
                <div className="glass rounded-xl p-4 flex flex-col justify-center gap-2.5">
                  {[
                    { label: 'Food', color: 'hsl(var(--primary))' },
                    { label: 'Transport', color: 'hsl(var(--accent))' },
                    { label: 'Shopping', color: 'hsl(var(--warning))' },
                  ].map(({ label, color }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                      <span className="text-xs text-muted-foreground">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Glow under preview */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-2/3 h-16 bg-primary/20 blur-3xl" />
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section id="features" className="py-24 px-5 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Features</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
              Everything you need to
            </h2>
            <p className="font-display text-3xl md:text-4xl font-bold text-gradient">
              master your finances
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Brain,
                title: 'AI Financial Insights',
                desc: 'Get personalized insights based on your spending patterns. AI analyzes your data to help you save more.',
                color: 'text-primary', bg: 'bg-primary/10',
              },
              {
                icon: BarChart3,
                title: 'Visual Analytics',
                desc: 'Beautiful charts show exactly where your money goes with monthly trends and category breakdowns.',
                color: 'text-accent', bg: 'bg-accent/10',
              },
              {
                icon: TrendingUp,
                title: 'Goal Tracking',
                desc: 'Set savings goals and track progress with visual bars. Achieve financial milestones faster.',
                color: 'text-warning', bg: 'bg-warning/10',
              },
              {
                icon: Shield,
                title: 'Budget Management',
                desc: 'Set category budgets and get alerts before you overspend. Stay in control of every dollar.',
                color: 'text-destructive', bg: 'bg-destructive/10',
              },
              {
                icon: Zap,
                title: 'Auto Categorization',
                desc: 'AI automatically categorizes your transactions so you never have to do it manually again.',
                color: 'text-primary', bg: 'bg-primary/10',
              },
              {
                icon: Sparkles,
                title: 'AI Chat Assistant',
                desc: 'Ask your AI financial advisor anything. Get instant, personalized answers about your money.',
                color: 'text-accent', bg: 'bg-accent/10',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="glass rounded-2xl p-6 hover:bg-card/80 transition-all duration-300 group"
              >
                <div className={`w-11 h-11 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h3 className="font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-5 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground mb-14">Start free, upgrade when you need more power</p>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Free */}
            <div className="glass rounded-2xl p-7 text-left">
              <h3 className="text-xl font-bold mb-1">Free</h3>
              <p className="text-muted-foreground text-sm mb-6">Perfect to get started</p>
              <div className="mb-7">
                <span className="text-4xl font-bold tabular">$0</span>
                <span className="text-muted-foreground text-sm font-normal">/month</span>
              </div>
              <ul className="space-y-2.5 mb-8">
                {['50 transactions/month', 'Basic dashboard', '2 budgets', '2 savings goals', 'Basic AI insights'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                    <span className="text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="block w-full text-center py-2.5 rounded-xl border border-border hover:bg-secondary/50 transition-colors font-semibold text-sm"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro */}
            <div className="rounded-2xl p-7 text-left bg-primary/10 border border-primary/30 relative overflow-hidden">
              <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold tracking-wide">
                POPULAR
              </div>
              <h3 className="text-xl font-bold mb-1">Pro</h3>
              <p className="text-muted-foreground text-sm mb-6">For serious savers</p>
              <div className="mb-7">
                <span className="text-4xl font-bold tabular">$9.99</span>
                <span className="text-muted-foreground text-sm font-normal">/month</span>
              </div>
              <ul className="space-y-2.5 mb-8">
                {[
                  'Unlimited transactions',
                  'Advanced AI insights',
                  'Unlimited budgets & goals',
                  'AI chat assistant',
                  'Spending predictions',
                  'Auto-categorization',
                  'Export reports (CSV)',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="block w-full text-center py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-semibold text-sm shadow-glow-sm"
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="py-24 px-5 md:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="glass rounded-3xl p-10 md:p-14 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-3xl rounded-full" />
            <div className="relative">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Ready to transform<br />your finances?
              </h2>
              <p className="text-muted-foreground mb-8 text-sm md:text-base">
                Join thousands of users who've taken control of their money with Fintrak AI.
              </p>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all hover:shadow-glow"
              >
                Start for Free Today <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-border py-8 px-5 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="font-display font-bold text-sm">Fintrak AI</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Fintrak AI. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
