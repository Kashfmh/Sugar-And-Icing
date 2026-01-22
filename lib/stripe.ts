import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Use the latest supported Stripe API version for types
  apiVersion: '2025-12-15.clover',
  typescript: true,
});