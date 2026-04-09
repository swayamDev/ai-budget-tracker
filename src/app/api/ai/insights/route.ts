import { NextResponse } from 'next/server';
import { requireApiUser } from '@/lib/db/user';
import { getDashboardStats } from '@/lib/db/transactions';
import { generateFinancialInsights } from '@/lib/ai/openai';

export async function GET() {
  try {
    const { user, error } = await requireApiUser();
    if (error) return error;

    const isPro = user.subscription?.plan === 'PRO';
    if (!isPro) {
      return NextResponse.json({ error: 'Pro subscription required' }, { status: 403 });
    }

    const stats = await getDashboardStats(user.id);
    const insights = await generateFinancialInsights(stats.transactions);
    return NextResponse.json({ insights });
  } catch (err) {
    console.error('[GET /api/ai/insights]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
