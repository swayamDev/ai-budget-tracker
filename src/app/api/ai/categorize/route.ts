import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { categorizeTransaction } from '@/lib/ai/openai';
import { getDbUser, isProUser } from '@/lib/db/user';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const pro = await isProUser(user.id);
  if (!pro) return NextResponse.json({ error: 'Pro plan required' }, { status: 403 });

  const { note } = await req.json();
  if (!note) return NextResponse.json({ error: 'Note required' }, { status: 400 });

  const category = await categorizeTransaction(note);
  return NextResponse.json({ category });
}
