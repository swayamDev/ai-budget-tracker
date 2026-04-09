import Stripe from 'stripe';

/**
 * Lazy Stripe client getter.
 * Prevents Next.js build-time crashes when STRIPE_SECRET_KEY is not set
 * in the build environment (CI, sandbox). The error surfaces at runtime.
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    // Stripe SDK v22 requires the 2026-03-25.dahlia API version string
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-03-25.dahlia',
    });
  }
  return _stripe;
}

/**
 * For backward compatibility — existing route files use `stripe.xxx`.
 * This re-exports a Proxy so callers keep `stripe.checkout.sessions.create()`
 * syntax while still being lazily initialized.
 */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return Reflect.get(getStripe(), prop);
  },
});

export const PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    features: [
      'Up to 50 transactions/month',
      'Basic dashboard',
      '2 budgets',
      '2 goals',
      'Basic insights',
    ],
    limits: { transactions: 50, budgets: 2, goals: 2, aiInsights: 3 },
  },
  PRO: {
    name: 'Pro',
    price: 999,
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? '',
    features: [
      'Unlimited transactions',
      'Advanced AI insights',
      'Unlimited budgets & goals',
      'AI chat assistant',
      'Spending predictions',
      'Auto-categorization',
      'Export reports',
      'Priority support',
    ],
    limits: { transactions: Infinity, budgets: Infinity, goals: Infinity, aiInsights: Infinity },
  },
};
