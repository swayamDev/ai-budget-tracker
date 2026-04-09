import { NextResponse } from 'next/server';
import { requireApiUser } from '@/lib/db/user';
import { stripe } from '@/lib/stripe/config';
import { absoluteUrl } from '@/lib/utils';

export async function POST() {
  try {
    const { user, error } = await requireApiUser();
    if (error) return error;

    const customerId = user.subscription?.stripeCustomerId;
    if (!customerId) {
      return NextResponse.json({ error: 'No billing account found' }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: absoluteUrl('/settings'),
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[POST /api/stripe/portal]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
