import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Fetch DB user (read-only).
 * Uses auth() instead of currentUser() → faster + safer
 */
export async function getDbUser() {
  const { userId } = await auth();
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { clerkId: userId },
    include: { subscription: true },
  });
}

/**
 * Create or update user from Clerk
 * DO NOT use cache() here — Clerk requires request context
 */
export async function getOrCreateUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const name =
    `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim();

  return prisma.user.upsert({
    where: { clerkId: clerkUser.id },

    update: {
      email,
      name,
      imageUrl: clerkUser.imageUrl,
    },

    create: {
      clerkId: clerkUser.id,
      email,
      name,
      imageUrl: clerkUser.imageUrl,

      subscription: {
        create: {
          plan: "FREE",
          status: "ACTIVE",
        },
      },
    },

    include: { subscription: true },
  });
}

/**
 * API route guard
 */
export async function requireApiUser() {
  const { userId } = await auth();

  if (!userId) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    } as const;
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { subscription: true },
  });

  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "User not found" }, { status: 404 }),
    } as const;
  }

  return { user, error: null } as const;
}

/**
 * Check if user is PRO
 */
export async function isProUser(userId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, status: true },
  });

  return subscription?.plan === "PRO" && subscription?.status === "ACTIVE";
}
