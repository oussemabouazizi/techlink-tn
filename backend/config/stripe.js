const Stripe = require('stripe');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const PRICE_IDS = {
  free: null,
  pro_freelancer: process.env.STRIPE_PRO_FREELANCER_PRICE_ID,
  business_client: process.env.STRIPE_BUSINESS_CLIENT_PRICE_ID,
};

module.exports = { stripe, PRICE_IDS };