import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiUser } from '@/lib/db/user';
import prisma from '@/lib/prisma';

const schema = z.object({
  currency: z.string().length(3).optional(),
  theme: z.enum(['dark', 'light']).optional(),
});

export async function PATCH(req: Request) {
  try {
    const { user, error } = await requireApiUser();
    if (error) return error;

    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: result.data,
      select: { id: true, currency: true, theme: true },
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error('[PATCH /api/user/settings]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
