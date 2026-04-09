import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiUser } from '@/lib/db/user';
import { createTransaction, getTransactions } from '@/lib/db/transactions';

const schema = z.object({
  amount: z.coerce.number().positive(),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1),
  note: z.string().optional(),
  date: z.string(),
});

export async function GET() {
  try {
    const { user, error } = await requireApiUser();
    if (error) return error;

    const transactions = await getTransactions(user.id);
    return NextResponse.json(transactions);
  } catch (err) {
    console.error('[GET /api/transactions]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, error } = await requireApiUser();
    if (error) return error;

    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const tx = await createTransaction(user.id, {
      ...result.data,
      date: new Date(result.data.date),
    });
    return NextResponse.json(tx, { status: 201 });
  } catch (err) {
    console.error('[POST /api/transactions]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
