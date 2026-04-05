import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { getDbUser } from '@/lib/db/user';
import { updateTransaction, deleteTransaction } from '@/lib/db/transactions';

const schema = z.object({
  amount: z.coerce.number().positive().optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().min(1).optional(),
  note: z.string().optional(),
  date: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: result.error.flatten() }, { status: 400 });

  const data: any = { ...result.data };
  if (data.date) data.date = new Date(data.date);

  const tx = await updateTransaction(params.id, user.id, data);
  return NextResponse.json(tx);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  await deleteTransaction(params.id, user.id);
  return NextResponse.json({ success: true });
}
