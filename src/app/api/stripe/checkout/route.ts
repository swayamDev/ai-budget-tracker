import { NextResponse } from 'next/server';
import { requireApiUser } from '@/lib/db/user';
import { stripe } from '@/lib/stripe/config';
import { absoluteUrl } from '@/lib/utils';

export async function POST() {
  try {
    const { user, error } = await requireApiUser();
    if (error) return error;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      billing_address_collection: 'auto',
      customer_email: user.email,
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID!,
          quantity: 1,
        },
      ],
      metadata: { userId: user.id },
      success_url: absoluteUrl('/dashboard?upgraded=true'),
      cancel_url: absoluteUrl('/pricing'),
      subscription_data: {
        metadata: { userId: user.id },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[POST /api/stripe/checkout]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
