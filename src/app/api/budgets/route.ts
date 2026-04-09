import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiUser } from '@/lib/db/user';
import { createBudget } from '@/lib/db/budget';

const schema = z.object({
  category: z.string().min(1),
  limitAmount: z.coerce.number().positive(),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2020),
});

export async function POST(req: Request) {
  try {
    const { user, error } = await requireApiUser();
    if (error) return error;

    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const budget = await createBudget(user.id, result.data);
    return NextResponse.json(budget, { status: 201 });
  } catch (err) {
    console.error('[POST /api/budgets]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
