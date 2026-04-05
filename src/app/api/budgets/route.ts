import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { getDbUser } from '@/lib/db/user';
import { createBudget } from '@/lib/db/budget';

const schema = z.object({
  category: z.string().min(1),
  limitAmount: z.coerce.number().positive(),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2020),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  const budget = await createBudget(user.id, result.data);
  return NextResponse.json(budget, { status: 201 });
}
