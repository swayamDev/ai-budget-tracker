import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiUser } from '@/lib/db/user';
import { categorizeTransaction } from '@/lib/ai/openai';

const schema = z.object({ note: z.string().min(1).max(500) });

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

    const category = await categorizeTransaction(result.data.note);
    return NextResponse.json({ category });
  } catch (err) {
    console.error('[POST /api/ai/categorize]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
