import { prisma } from '@/lib/prisma';
// sendEmail will be used when email automation is implemented
// import { sendEmail } from '@/lib/email';

export interface EmailSequence {
  name: string;
  trigger: 'welcome' | 'abandoned_cart' | 'post_purchase' | 'win_back';
  delay: number; // minutes
  subject: string;
  content: string;
}

/**
 * Welcome Email Sequence
 */
export const welcomeSequence: EmailSequence[] = [
  {
    name: 'Welcome Email',
    trigger: 'welcome',
    delay: 0, // Send immediately
    subject: "🎣 Welcome to La Pesqueria Outfitters - Your Fishing Journey Begins!",
    content: `
      <h1>Welcome to the La Pesqueria Crew! 🎣</h1>
      <p>Thank you for joining our fishing community!</p>
      
      <h2>Here's what makes us special:</h2>
      <ul>
        <li>🎣 Premium fishing apparel and gear</li>
        <li>☀️ UPF 50+ sun protection</li>
        <li>💧 Moisture-wicking technology</li>
        <li>🎁 Exclusive subscriber-only offers</li>
      </ul>
      
      <p><strong>Special Welcome Gift:</strong> Use code <strong>FISH20</strong> for 20% OFF your first purchase!</p>
      
      <a href="https://lapesqueria.com/products" style="background: #FF4500; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0;">Shop the Collection →</a>
      
      <p>Tight lines,<br>The La Pesqueria Team 🎯</p>
    `
  },
  {
    name: 'Product Showcase',
    trigger: 'welcome',
    delay: 2880, // 2 days
    subject: '✨ Discover Our Most-Loved Fishing Gear',
    content: `
      <h1>Our Customers' Favorites 🎣</h1>
      <p>Since you joined us, we wanted to share some of our most popular pieces...</p>
      
      <p>Each piece is designed for serious anglers. Here are the pieces our community loves:</p>
      
      <p><strong>👉 Browse Best Sellers</strong></p>
      
      <a href="https://lapesqueria.com/products?featured=true">View Collection →</a>
      
      <p>Remember: Your code <strong>FISH20</strong> is still active! 🎁</p>
    `
  }
];

/**
 * Abandoned Cart Sequence
 */
export const abandonedCartSequence: EmailSequence[] = [
  {
    name: 'Cart Reminder - 1 Hour',
    trigger: 'abandoned_cart',
    delay: 60, // 1 hour
    subject: '🎣 You Left Something Behind...',
    content: `
      <h1>Don't Forget Your Fishing Gear! 🎣</h1>
      <p>We noticed you left some gear in your cart...</p>
      
      <p>Your items are waiting for you:</p>
      {cart_items}
      
      <p><strong>Complete your purchase now and save 20% with code FISH20!</strong></p>
      
      <a href="https://lapesqueria.com/cart">Complete My Purchase →</a>
      
      <p>These popular items may sell out soon! 💫</p>
    `
  },
  {
    name: 'Cart Reminder - Extra Incentive',
    trigger: 'abandoned_cart',
    delay: 1440, // 24 hours
    subject: '🎁 Still Thinking? Here\'s An Extra Surprise!',
    content: `
      <h1>We Really Want You to Have This Gear! 🎣</h1>
      <p>Your cart is still waiting, and we've added something special...</p>
      
      <p><strong>🎉 Use code FISH20 for 20% OFF + FREE SHIPPING on orders $75+!</strong></p>
      
      <a href="https://lapesqueria.com/cart">Claim My Discount →</a>
      
      <p>This offer expires in 48 hours! ⏰</p>
    `
  }
];

/**
 * Post-Purchase Sequence
 */
export const postPurchaseSequence: EmailSequence[] = [
  {
    name: 'Thank You Email',
    trigger: 'post_purchase',
    delay: 0,
    subject: '🎉 Thank You for Your Order!',
    content: `
      <h1>Your Gear is On Its Way! 🎣</h1>
      <p>Thank you so much for your purchase! We're thrilled to welcome you to the La Pesqueria family.</p>
      
      <p><strong>📦 Your order is being carefully prepared...</strong></p>
      
      <p>You'll receive tracking information as soon as your package ships!</p>
      
      <p>🎯 Quality fishing gear for your next adventure. Check out what else we have:</p>
      
      <p>Follow us on Instagram @lapesqueria to see more gear releases!</p>
    `
  },
  {
    name: 'Review Request',
    trigger: 'post_purchase',
    delay: 10080, // 7 days
    subject: '🎣 How Are You Liking Your New Gear?',
    content: `
      <h1>We'd Love Your Feedback! ⭐</h1>
      <p>It's been a week since your gear arrived...</p>
      
      <p>We hope you're absolutely loving it! Would you mind sharing your experience?</p>
      
      <p>Your review helps other anglers discover quality fishing apparel.</p>
      
      <a href="https://lapesqueria.com/reviews">Leave a Review →</a>
      
      <p><strong>As a thank you, we'll send you an exclusive 15% OFF code for your next purchase!</strong></p>
    `
  }
];

/**
 * Win-Back Sequence (for inactive customers)
 */
export const winBackSequence: EmailSequence[] = [
  {
    name: 'We Miss You',
    trigger: 'win_back',
    delay: 0,
    subject: '🎣 We Miss You! Come Back to the Water...',
    content: `
      <h1>The Fish Are Waiting! 🎣</h1>
      <p>It's been a while since we've seen you...</p>
      
      <p>We have new gear you'll love, and we're offering you an exclusive welcome-back gift:</p>
      
      <p><strong>🎁 20% OFF your next purchase with code FISH20</strong></p>
      
      <p>Plus, check out what's new:</p>
      <ul>
        <li>New UPF 50+ performance shirts</li>
        <li>Salt-resistant hats and gear</li>
        <li>Fresh fishing apparel for 2026</li>
      </ul>
      
      <a href="https://lapesqueria.com/products">Get Back on the Water →</a>
    `
  }
];

/**
 * Schedule email for a specific sequence
 */
export async function scheduleSequenceEmail(
  recipientEmail: string,
  sequence: EmailSequence,
  variables: Record<string, string> = {}
): Promise<void> {
  // Replace variables in content
  let content = sequence.content;
  Object.entries(variables).forEach(([key, value]) => {
    content = content.replace(new RegExp(`{${key}}`, 'g'), value);
  });

  // Schedule the email - store delay in variables since scheduledAt isn't in schema
  const sendAt = new Date(Date.now() + sequence.delay * 60 * 1000);

  await prisma.emailLog.create({
    data: {
      to: recipientEmail,
      subject: sequence.subject,
      template: 'NEWSLETTER', // Using existing template
      status: 'pending',
      variables: {
        content,
        sequenceName: sequence.name,
        scheduledFor: sendAt.toISOString(),
        delayMinutes: sequence.delay,
        ...variables
      }
    }
  });
}

/**
 * Trigger welcome sequence for new subscriber
 */
export async function triggerWelcomeSequence(email: string, name?: string): Promise<void> {
  for (const sequence of welcomeSequence) {
    await scheduleSequenceEmail(email, sequence, {
      name: name || 'Anglers'
    });
  }
}

/**
 * Trigger abandoned cart sequence
 */
export async function triggerAbandonedCartSequence(
  email: string,
  cartItems: string
): Promise<void> {
  for (const sequence of abandonedCartSequence) {
    await scheduleSequenceEmail(email, sequence, {
      cart_items: cartItems
    });
  }
}
