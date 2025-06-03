import { NextResponse } from 'next/server';
import { handleStripeWebhook } from '../../../lib/stripe';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    // TODO: Verify webhook signature when backend is ready
    // const event = stripe.webhooks.constructEvent(
    //   body,
    //   signature,
    //   process.env.STRIPE_WEBHOOK_SECRET!
    // );

    // For now, just parse the body as JSON
    const event = JSON.parse(body);

    // Log event details
    console.log('Received Stripe webhook event:', {
      type: event.type,
      id: event.id,
      created: new Date(event.created * 1000).toISOString(),
    });

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
        console.log('New subscription:', {
          customerId: event.data.object.customer,
          subscriptionId: event.data.object.id,
          status: event.data.object.status,
          plan: event.data.object.items.data[0].price.nickname,
        });
        break;

      case 'customer.subscription.updated':
        console.log('Subscription updated:', {
          customerId: event.data.object.customer,
          subscriptionId: event.data.object.id,
          status: event.data.object.status,
          plan: event.data.object.items.data[0].price.nickname,
        });
        break;

      case 'customer.subscription.deleted':
        console.log('Subscription canceled:', {
          customerId: event.data.object.customer,
          subscriptionId: event.data.object.id,
          canceledAt: new Date(event.data.object.canceled_at * 1000).toISOString(),
        });
        break;

      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Checkout completed:', {
          sessionId: session.id,
          customerId: session.customer,
          amount: session.amount_total / 100, // Convert from cents
          metadata: session.metadata,
        });
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Process the event
    await handleStripeWebhook(event);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
} 