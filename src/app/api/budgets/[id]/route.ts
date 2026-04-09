import { NextResponse } from 'next/server';
import { requireApiUser } from '@/lib/db/user';
import { deleteBudget } from '@/lib/db/budget';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await requireApiUser();
    if (error) return error;

    const { id } = await params;
    await deleteBudget(id, user.id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('[DELETE /api/budgets/:id]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
