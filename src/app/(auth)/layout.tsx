import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/15 blur-[100px] rounded-full" />
        <div className="absolute bottom-1/4 left-1/4 w-[200px] h-[200px] bg-accent/10 blur-[80px] rounded-full" />
      </div>

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8 relative">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-glow">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl">Fintrak AI</span>
      </Link>

      <div className="w-full max-w-md relative">
        {children}
      </div>
    </div>
  );
}
