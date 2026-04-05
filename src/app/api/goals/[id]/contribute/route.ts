import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { getDbUser } from '@/lib/db/user';
import { updateGoalAmount } from '@/lib/db/goals';

const schema = z.object({ amount: z.coerce.number().positive() });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  const goal = await updateGoalAmount(params.id, user.id, result.data.amount);
  return NextResponse.json(goal);
}
