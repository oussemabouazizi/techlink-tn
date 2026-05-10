const { stripe, PRICE_IDS } = require('../config/stripe');
const { supabaseAdmin } = require('../config/supabase');

exports.createCheckoutSession = async (req, res) => {
  try {
    const { plan } = req.body; // 'pro_freelancer' or 'business_client'
    if (!PRICE_IDS[plan]) return res.status(400).json({ error: 'Invalid plan' });

    let { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', req.user.id)
      .single();

    let customerId = sub?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        metadata: { user_id: req.user.id },
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard/subscription?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?canceled=true`,
      metadata: { user_id: req.user.id, plan },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPortalSession = async (req, res) => {
  try {
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', req.user.id)
      .single();

    if (!sub?.stripe_customer_id) {
      return res.status(400).json({ error: 'No subscription found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL}/dashboard/subscription`,
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.webhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const { user_id, plan } = session.metadata;
      await supabaseAdmin.from('subscriptions').upsert({
        user_id,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        plan,
        status: 'active',
        current_period_start: new Date(session.subscription_details?.current_period_start * 1000).toISOString(),
        current_period_end: new Date(session.subscription_details?.current_period_end * 1000).toISOString(),
      });
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'past_due' })
        .eq('stripe_subscription_id', invoice.subscription);
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'canceled', plan: 'free' })
        .eq('stripe_subscription_id', subscription.id);
      break;
    }
  }

  res.json({ received: true });
};