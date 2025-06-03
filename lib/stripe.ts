import Stripe from 'stripe';

// Initialize Stripe with test mode
export const stripe = new Stripe(process.env.EXPO_PUBLIC_STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// Subscription plan IDs from Stripe Dashboard
export const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    id: process.env.EXPO_PUBLIC_STRIPE_MONTHLY_PRICE_ID!,
    amount: 3,
    interval: 'month',
  },
  YEARLY: {
    id: process.env.EXPO_PUBLIC_STRIPE_YEARLY_PRICE_ID!,
    amount: 25,
    interval: 'year',
  },
} as const;

// Guest fee configuration
export const GUEST_FEE = {
  amount: 0.25,
  currency: 'usd',
  description: 'Guest round saving fee',
} as const;

// Create checkout session for subscription
export async function createSubscriptionCheckout(
  priceId: string,
  customerId?: string
): Promise<{ url: string }> {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.EXPO_PUBLIC_APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.EXPO_PUBLIC_APP_URL}/subscription/cancel`,
      customer: customerId,
      allow_promotion_codes: true,
    });

    return { url: session.url! };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

// Create checkout session for guest fee
export async function createGuestFeeCheckout(
  gameId: string,
  guestCount: number
): Promise<{ url: string }> {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: GUEST_FEE.currency,
            product_data: {
              name: 'Guest Round Saving',
              description: `Save ${guestCount} guest round${guestCount > 1 ? 's' : ''}`,
            },
            unit_amount: Math.round(GUEST_FEE.amount * 100 * guestCount), // Convert to cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.EXPO_PUBLIC_APP_URL}/games/${gameId}/summary?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.EXPO_PUBLIC_APP_URL}/games/${gameId}/summary`,
      metadata: {
        gameId,
        guestCount,
      },
    });

    return { url: session.url! };
  } catch (error) {
    console.error('Error creating guest fee checkout:', error);
    throw error;
  }
}

// Mock function to handle webhook events
export async function handleStripeWebhook(event: Stripe.Event) {
  // TODO: Implement actual webhook handling when backend is ready
  console.log('Received webhook event:', event.type);
  
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      // Handle subscription changes
      break;
    case 'customer.subscription.deleted':
      // Handle subscription cancellation
      break;
    case 'checkout.session.completed':
      // Handle successful payment
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

// Mock function to sync subscription status
export async function syncSubscriptionStatus(userId: string): Promise<boolean> {
  // TODO: Implement actual subscription sync when backend is ready
  console.log('Syncing subscription status for user:', userId);
  return false;
} 