import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
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
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
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
