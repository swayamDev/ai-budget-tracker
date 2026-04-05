import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDbUser } from '@/lib/db/user';
import { deleteBudget } from '@/lib/db/budget';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await deleteBudget(params.id, user.id);
  return NextResponse.json({ success: true });
}
