import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { chatWithFinancialAdvisor } from '@/lib/ai/openai';
import { getDbUser, isProUser } from '@/lib/db/user';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const pro = await isProUser(user.id);
  if (!pro) return NextResponse.json({ error: 'Pro plan required' }, { status: 403 });

  const { message, context } = await req.json();
  if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

  const reply = await chatWithFinancialAdvisor(message, context);
  return NextResponse.json({ reply });
}
