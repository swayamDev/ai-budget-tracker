import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { getDbUser } from '@/lib/db/user';
import { createTransaction, getTransactions } from '@/lib/db/transactions';

const schema = z.object({
  amount: z.coerce.number().positive(),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1),
  note: z.string().optional(),
  date: z.string(),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const transactions = await getTransactions(user.id);
  return NextResponse.json(transactions);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: result.error.flatten() }, { status: 400 });

  const tx = await createTransaction(user.id, {
    ...result.data,
    date: new Date(result.data.date),
  });
  return NextResponse.json(tx, { status: 201 });
}
