import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover',
});

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Fetching recent successful payments from Stripe...\n');

  try {
    // Get payment intents from last 7 days
    const sevenDaysAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);
    
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 100,
      created: { gte: sevenDaysAgo },
    });

    console.log(`Found ${paymentIntents.data.length} payment intents in last 7 days`);

    const succeededPayments = paymentIntents.data.filter(pi => pi.status === 'succeeded');
    console.log(`${succeededPayments.length} successful payments\n`);

    if (succeededPayments.length === 0) {
      console.log('No successful payments found in last 7 days.');
      return;
    }

    // Check which ones are missing from database
    const missingOrders = [];

    for (const payment of succeededPayments) {
      const existingOrder = await prisma.order.findFirst({
        where: {
          stripePaymentId: payment.id
        }
      });

      if (!existingOrder) {
        // Get the checkout session for this payment
        const sessions = await stripe.checkout.sessions.list({
          payment_intent: payment.id,
          limit: 1,
        });

        if (sessions.data.length > 0) {
          missingOrders.push({
            payment,
            session: sessions.data[0],
          });
        }
      }
    }

    console.log(`\n📉 Missing orders: ${missingOrders.length}`);

    if (missingOrders.length === 0) {
      console.log('✅ All Stripe payments have corresponding orders in database!');
      return;
    }

    console.log('\n⚠️  The following Stripe payments do NOT have orders in your database:\n');

    missingOrders.forEach((missing, index) => {
      const { payment, session } = missing;
      console.log(`${index + 1}. Payment Intent: ${payment.id}`);
      console.log(`   Amount: $${(payment.amount / 100).toFixed(2)}`);
      console.log(`   Email: ${session.customer_email || session.customer_details?.email || 'N/A'}`);
      console.log(`   Created: ${new Date(payment.created * 1000).toLocaleString()}`);
      console.log(`   Session ID: ${session.id}`);
      console.log('');
    });

    console.log('\n🔧 What happened?');
    console.log('These payments succeeded in Stripe but the webhook that creates orders in your database failed.');
    console.log('This typically happens when:');
    console.log('  1. Webhook secret was incorrect/not set');
    console.log('  2. Application was not running');
    console.log('  3. Webhook endpoint was not accessible\n');

    console.log('💡 How to fix:');
    console.log('  1. Verify webhook secret is correctly set in Coolify (you provided: whsec_LLeIjr...)');
    console.log('  2. Restart your Coolify container to ensure env vars are loaded');
    console.log('  3. Go to Stripe Dashboard → Developers → Webhooks');
    console.log('  4. Click on your webhook endpoint');
    console.log('  5. Find these failed events and click "Resend" to retry them');
    console.log('\nOR create a recovery script to manually process these checkout sessions.');

  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
