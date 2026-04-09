'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { createTransaction, updateTransaction, deleteTransaction } from '@/lib/db/transactions';

const createSchema = z.object({
  amount: z.coerce.number().positive(),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1),
  note: z.string().optional(),
  date: z.string().min(1),
});

async function getInternalUser() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });
  if (!user) throw new Error('User not found');
  return user;
}

export async function createTransactionAction(data: z.infer<typeof createSchema>) {
  const user = await getInternalUser();
  const validated = createSchema.parse(data);
  const tx = await createTransaction(user.id, {
    ...validated,
    date: new Date(validated.date),
  });
  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  return tx;
}

export async function updateTransactionAction(
  id: string,
  data: Partial<z.infer<typeof createSchema>>
) {
  const user = await getInternalUser();
  const tx = await updateTransaction(id, user.id, {
    ...data,
    date: data.date ? new Date(data.date) : undefined,
  });
  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  return tx;
}

export async function deleteTransactionAction(id: string) {
  const user = await getInternalUser();
  await deleteTransaction(id, user.id);
  revalidatePath('/transactions');
  revalidatePath('/dashboard');
}
