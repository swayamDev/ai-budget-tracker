import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/config';
import prisma from '@/lib/prisma';

// Stripe requires the raw body — do NOT parse as JSON
export const dynamic = 'force-dynamic';

function mapStripeStatus(status: string): 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' {
  if (status === 'active') return 'ACTIVE';
  if (status === 'past_due') return 'PAST_DUE';
  return 'CANCELLED';
}

/**
 * Stripe v22 (API 2026-03-25.dahlia) breaking changes on Invoice:
 * - `invoice.subscription` is REMOVED — use `invoice.parent.subscription_details.subscription`
 * - `subscription.current_period_end` is REMOVED — use `subscription.items.data[0].current_period_end`
 */
export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId) {
          console.warn('[Webhook] checkout.session.completed: missing userId in metadata');
          break;
        }
        await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            plan: 'PRO',
            status: 'ACTIVE',
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          },
          update: {
            plan: 'PRO',
            status: 'ACTIVE',
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          },
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;

        // Stripe v22: invoice.subscription is gone — subscription ID now lives in invoice.parent
        const parent = invoice.parent;
        const subscriptionId =
          parent?.type === 'subscription_details' &&
          parent.subscription_details?.subscription
            ? typeof parent.subscription_details.subscription === 'string'
              ? parent.subscription_details.subscription
              : parent.subscription_details.subscription.id
            : null;

        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        // Stripe v22: current_period_end moved to subscription.items.data[*].current_period_end
        const periodEnd = subscription.items?.data?.[0]?.current_period_end ?? null;

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscriptionId },
          data: {
            status: 'ACTIVE',
            plan: 'PRO',
            currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { status: 'CANCELLED', plan: 'FREE' },
        });
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        // Stripe v22: current_period_end moved to subscription.items.data[*].current_period_end
        const periodEnd = subscription.items?.data?.[0]?.current_period_end ?? null;

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: mapStripeStatus(subscription.status),
            currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
          },
        });
        break;
      }

      default:
        // Unhandled event type — silently ignore
        break;
    }
  } catch (err) {
    console.error(`[Webhook] Handler error for ${event.type}:`, err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
