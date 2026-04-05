import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateFinancialInsights } from '@/lib/ai/openai';
import { getDbUser, isProUser } from '@/lib/db/user';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const pro = await isProUser(user.id);
  if (!pro) return NextResponse.json({ error: 'Pro plan required' }, { status: 403 });

  const { transactions } = await req.json();
  const insights = await generateFinancialInsights(transactions ?? []);

  // Log AI usage
  await prisma.aiLog.create({
    data: { userId: user.id, type: 'insights', prompt: 'financial_insights', response: insights },
  });

  return NextResponse.json({ insights });
}
