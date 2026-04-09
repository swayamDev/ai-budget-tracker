import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiUser } from '@/lib/db/user';
import { updateTransaction, deleteTransaction, getTransactionById } from '@/lib/db/transactions';

const updateSchema = z.object({
  amount: z.coerce.number().positive().optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().min(1).optional(),
  note: z.string().optional(),
  date: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await requireApiUser();
    if (error) return error;

    const { id } = await params;
    const body = await req.json();
    const result = updateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const existing = await getTransactionById(id, user.id);
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const updated = await updateTransaction(id, user.id, {
      ...result.data,
      date: result.data.date ? new Date(result.data.date) : undefined,
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error('[PATCH /api/transactions/:id]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await requireApiUser();
    if (error) return error;

    const { id } = await params;

    const existing = await getTransactionById(id, user.id);
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await deleteTransaction(id, user.id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('[DELETE /api/transactions/:id]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
