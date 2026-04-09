import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiUser } from '@/lib/db/user';
import { chatWithAdvisor } from '@/lib/ai/openai';

const schema = z.object({
  message: z.string().min(1).max(2000),
  context: z.object({
    income: z.number(),
    expense: z.number(),
    balance: z.number(),
    recentTransactions: z.array(z.any()),
  }),
});

export async function POST(req: Request) {
  try {
    const { user, error } = await requireApiUser();
    if (error) return error;

    const isPro = user.subscription?.plan === 'PRO';
    if (!isPro) {
      return NextResponse.json({ error: 'Pro subscription required' }, { status: 403 });
    }

    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const reply = await chatWithAdvisor(result.data.message, result.data.context);
    return NextResponse.json({ reply });
  } catch (err) {
    console.error('[POST /api/ai/chat]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
