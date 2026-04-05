import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { getDbUser } from '@/lib/db/user';
import prisma from '@/lib/prisma';

const schema = z.object({
  currency: z.string().optional(),
  name: z.string().optional(),
});

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 });

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: result.data,
  });

  return NextResponse.json(updated);
}
