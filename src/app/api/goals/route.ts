import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiUser } from '@/lib/db/user';
import { createGoal, getGoals } from '@/lib/db/goals';

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  targetAmount: z.coerce.number().positive(),
  currentAmount: z.coerce.number().min(0).optional(),
  deadline: z.string().optional(),
});

export async function GET() {
  try {
    const { user, error } = await requireApiUser();
    if (error) return error;

    const goals = await getGoals(user.id);
    return NextResponse.json(goals);
  } catch (err) {
    console.error('[GET /api/goals]', err);
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

    const goal = await createGoal(user.id, {
      ...result.data,
      deadline: result.data.deadline ? new Date(result.data.deadline) : undefined,
    });
    return NextResponse.json(goal, { status: 201 });
  } catch (err) {
    console.error('[POST /api/goals]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
