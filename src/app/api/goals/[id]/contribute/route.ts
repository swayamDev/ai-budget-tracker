import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiUser } from '@/lib/db/user';
import { contributeToGoal } from '@/lib/db/goals';

const schema = z.object({ amount: z.coerce.number().positive() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await requireApiUser();
    if (error) return error;

    const { id } = await params;
    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const goal = await contributeToGoal(id, user.id, result.data.amount);
    return NextResponse.json(goal);
  } catch (err) {
    console.error('[POST /api/goals/:id/contribute]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
