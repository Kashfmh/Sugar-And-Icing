import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // If you see a type error here later, just remove this line or check your Stripe Dashboard for your version.
  apiVersion: '2025-01-27.acacia', 
  typescript: true,
});