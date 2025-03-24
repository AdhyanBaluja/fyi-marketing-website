require('dotenv').config();
const stripePkg = require('stripe');
const stripe = stripePkg(process.env.STRIPE_SECRET_KEY); 
const User = require('../models/User');

//
// 1) Create Checkout Session
//
exports.createCheckoutSession = async (req, res) => {
  try {
    const { planName, userId } = req.body;

    // Convert amounts to pence (Stripe expects the smallest currency unit)
    let amountInPence;
    if (planName === 'Standard') {
      amountInPence = 50 * 1; // 
    } else if (planName === 'Premium') {
      amountInPence = 100 * 1; // £1
    } else {
      return res.status(400).json({ error: 'Invalid plan name' });
    }

    // Set URLs based on environment: use PRODUCTION_CLIENT_URL in production, otherwise CLIENT_URL.
    const successUrl = `${
      process.env.NODE_ENV === 'production'
        ? process.env.PRODUCTION_CLIENT_URL
        : process.env.CLIENT_URL
    }/payment-success?session_id={CHECKOUT_SESSION_ID}`;

    const cancelUrl = `${
      process.env.NODE_ENV === 'production'
        ? process.env.PRODUCTION_CLIENT_URL
        : process.env.CLIENT_URL
    }/payment-error`;

    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `${planName} Plan`,
            },
            unit_amount: amountInPence,
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      // Metadata ties this payment to the plan and user
      metadata: {
        planName,
        userId: userId || 'unknownUser',
      },
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ error: 'Something went wrong creating session' });
  }
};

//
// 2) Handle Stripe Webhook
//
exports.handleStripeWebhook = async (req, res) => {
  // Stripe requires the raw body for signature verification.
  // Ensure your Express app uses:
  // app.use('/stripe-webhook', express.raw({ type: 'application/json' }));
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // The raw body must be passed here.
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event types
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const planName = session.metadata?.planName;
      const userId = session.metadata?.userId;

      console.log('Payment success for plan:', planName, 'User ID:', userId);

      try {
        if (userId && planName) {
          // Update the user's membership plan in the database
          const user = await User.findById(userId);
          if (user) {
            user.membershipPlan = planName;
            // Set membership to expire in 30 days
            const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
            user.planExpiresAt = new Date(Date.now() + THIRTY_DAYS_MS);

            await user.save();
            console.log(`User ${userId} plan upgraded to ${planName}, expires on ${user.planExpiresAt}`);
          } else {
            console.log('No user found with ID:', userId);
          }
        }
      } catch (dbErr) {
        console.error('Error updating user plan in DB:', dbErr);
      }
      break;
    }
    // Optionally, handle other event types here.
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Acknowledge receipt of the event
  return res.json({ received: true });
};
