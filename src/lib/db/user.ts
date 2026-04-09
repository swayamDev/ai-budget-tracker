import { cache } from 'react';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';

/**
 * Fetch the DB user record (no upsert). Fast read-only lookup.
 * Wrapped in React cache() so multiple server components in one render
 * only hit the DB once.
 */
export const getDbUser = cache(async () => {
  const { userId } = await auth();
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { clerkId: userId },
    include: { subscription: true },
  });
});

/**
 * Upsert user from Clerk on first visit / profile change.
 * Wrapped in React cache() — safe to call in every server component.
 */
export const getOrCreateUser = cache(async () => {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  return prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: {
      email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
      name: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim(),
      imageUrl: clerkUser.imageUrl,
    },
    create: {
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
      name: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim(),
      imageUrl: clerkUser.imageUrl,
      subscription: {
        create: {
          plan: 'FREE',
          status: 'ACTIVE',
        },
      },
    },
    include: { subscription: true },
  });
});

/**
 * Shared auth guard for API routes.
 * Returns { user, error } so routes can early-return on failure.
 */
export async function requireApiUser() {
  const { userId } = await auth();
  if (!userId) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    } as const;
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { subscription: true },
  });

  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: 'User not found' }, { status: 404 }),
    } as const;
  }

  return { user, error: null } as const;
}

export async function isProUser(userId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, status: true },
  });
  return subscription?.plan === 'PRO' && subscription?.status === 'ACTIVE';
}
