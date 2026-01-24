# 🔐 Stripe Live Checkout Setup Guide

## ✅ What's Already Built

Your complete checkout system includes:

### Frontend
- **Checkout Page** (`/checkout`) - Collects shipping info, validates user session
- **Success Page** (`/checkout/success`) - Shows order confirmation, clears cart
- **Cart Context** - Manages cart items, calculates totals (subtotal, shipping, tax)

### Backend APIs
- **Create Checkout Session** (`/api/checkout/create-session`)
  - Creates Stripe Checkout Session
  - Stores order metadata (items, shipping, customer info)
  - Redirects to Stripe-hosted payment page

- **Webhook Handler** (`/api/webhooks/stripe`)
  - Listens for `checkout.session.completed` events
  - Creates order in database with all details
  - Creates conservation donation record (10% of subtotal)
  - Awards customer rewards points
  - Deducts inventory from stock
  - Sends order confirmation email

### Order Processing
- **Full order creation** with conservation tracking
- **Automatic inventory management** (deducts stock on purchase)
- **Rewards points system** (1 point per $1 spent)
- **Email confirmations** sent automatically

---

## 🔧 Setup Steps

### Step 1: Get Your Stripe API Keys

1. Go to https://dashboard.stripe.com/apikeys
2. Copy your keys (use **test** keys for development, **live** keys for production)

### Step 2: Set Up Webhook Endpoint

1. Go to https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Configure:
   - **URL**:
     - Development: `http://localhost:3000/api/webhooks/stripe`
     - Production: `https://yourdomain.com/api/webhooks/stripe`
   - **Events to listen to**:
     - ✅ `checkout.session.completed`
     - ✅ `payment_intent.succeeded`
     - ✅ `payment_intent.payment_failed`
4. Click **"Add endpoint"**
5. Copy the **Signing secret** (starts with `whsec_...`)

### Step 3: Update Environment Variables

Replace the placeholder values in `.env.local`:

```bash
# Replace these with your ACTUAL Stripe keys from Step 1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51ABC... # Your actual key
STRIPE_SECRET_KEY=sk_test_51ABC...                  # Your actual key

# Add the webhook secret from Step 2
STRIPE_WEBHOOK_SECRET=whsec_XYZ...                   # Your actual webhook secret
```

### Step 4: Restart Your Development Server

After updating `.env.local`, restart the server:

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

---

## 🧪 Testing the Checkout Flow

### 1. Add Items to Cart
- Navigate to `/products`
- Click "Add to Cart" on any product
- Cart should show in the header

### 2. Start Checkout
- Click "Checkout" button
- You'll be redirected to `/checkout`
- Fill in shipping information

### 3. Process Payment
- Click "Proceed to Payment"
- You'll be redirected to Stripe's hosted checkout page
- Use Stripe test card: `4242 4242 4242 4242`
  - Expiry: Any future date (e.g., `12/34`)
  - CVC: Any 3 digits (e.g., `123`)
  - ZIP: Any 5 digits (e.g., `12345`)

### 4. Verify Success
After payment, you should:
- Be redirected to `/checkout/success`
- See success message
- Cart should be cleared
- Receive order confirmation email

### 5. Check Database
Order should be created with:
- All line items
- Conservation donation (10% of subtotal)
- Rewards points awarded
- Inventory deducted from stock

---

## 🔍 Verification Checklist

Use this checklist to verify everything works:

- [ ] Environment variables loaded (check with `echo $STRIPE_SECRET_KEY` in terminal)
- [ ] Development server restarted after adding keys
- [ ] Stripe webhook endpoint created and active
- [ ] Test checkout creates Stripe session
- [ ] Test payment redirects to Stripe
- [ ] Test payment completes successfully
- [ ] Webhook receives `checkout.session.completed` event
- [ ] Order created in database
- [ ] Conservation donation record created
- [ ] Rewards points awarded to customer
- [ ] Inventory deducted from product variants
- [ ] Order confirmation email sent
- [ ] Success page displays correctly
- [ ] Cart cleared after checkout

---

## 🐛 Troubleshooting

### "Payment processing is not currently available"
- ✅ Check that `STRIPE_SECRET_KEY` is set and not a placeholder
- ✅ Restart dev server after updating `.env.local`
- ✅ Verify key starts with `sk_test_` or `sk_live_`

### Webhook not receiving events
- ✅ Check `STRIPE_WEBHOOK_SECRET` is set correctly
- ✅ Verify webhook URL matches your server URL
- ✅ Check webhook is active in Stripe Dashboard
- ✅ For local testing, use Stripe CLI or ngrok for webhook forwarding

### Order not created after payment
- ✅ Check webhook logs in Stripe Dashboard
- ✅ Check server console for webhook errors
- ✅ Verify `createOrder` function in `src/lib/orders.ts` is working

### Email not sent
- ✅ Check email configuration (Resend API key, etc.)
- ✅ Verify email sending doesn't block order creation (it's in try-catch)
- ✅ Check server logs for email errors

---

## 📊 What Happens on Checkout

### User Journey:
1. User fills cart with products
2. Navigates to `/checkout`
3. Enters shipping information
4. Clicks "Proceed to Payment" ($XX.XX)
5. Redirected to Stripe Checkout (hosted by Stripe)
6. Enters payment details (card number, expiry, CVC)
7. Submits payment
8. Stripe processes payment
9. Redirected to `/checkout/success?session_id=...`
10. Cart cleared, success message shown

### Server Journey:
1. `POST /api/checkout/create-session`
   - Validates user session
   - Creates Stripe Checkout Session
   - Returns session URL to redirect user

2. User completes payment on Stripe

3. `POST /api/webhooks/stripe` (Stripe sends webhook)
   - Verifies webhook signature
   - Extracts order metadata
   - Calls `createOrder()` function:
     - Creates Order record
     - Creates OrderItems
     - Creates ConservationDonation (10% of subtotal)
     - Awards CustomerReward points
     - Creates PointTransaction
     - Deducts inventory via InventoryTransaction
     - Updates ProductVariant stock
   - Sends order confirmation email
   - Returns success response to Stripe

---

## 🚀 Going Live

When ready for production:

1. **Switch to Live API Keys**:
   - Get live keys from https://dashboard.stripe.com/apikeys
   - Update `.env.local` (or production env vars):
     ```bash
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
     STRIPE_SECRET_KEY=sk_live_...
     ```

2. **Update Webhook URL**:
   - Create new webhook endpoint with production URL
   - Update `STRIPE_WEBHOOK_SECRET` with new signing secret

3. **Test in Production Mode**:
   - Test with real cards (or test cards in test mode)
   - Verify emails are sent to real addresses
   - Check all orders are created correctly

4. **Enable Payment Methods** (optional):
   - In Stripe Dashboard, enable additional payment methods:
     - Apple Pay
     - Google Pay
     - Link (Stripe's 1-click checkout)

---

## 💡 Additional Features

Your checkout system also includes:

### Conservation Tracking
- 10% of every purchase goes to marine conservation
- Tracked per order in `ConservationDonation` table
- Status: `PLEDGED` → `DONATED` (update manually or via admin panel)

### Rewards System
- Customers earn 1 point per $1 spent
- Points tracked in `CustomerReward` table
- Transaction history in `PointTransaction` table
- Tier system: Bronze → Silver → Gold → Platinum

### Inventory Management
- Automatic stock deduction on purchase
- Full audit trail in `InventoryTransaction` table
- Transaction types: SALE, RESTOCK, ADJUSTMENT, RESERVATION

### Order Emails
- Automatic confirmation email sent to customer
- Includes order summary, conservation impact, rewards points
- Uses React Email components for beautiful HTML emails

---

## 📝 Summary

Your checkout system is **production-ready** and includes:

✅ Stripe Checkout integration
✅ Secure webhook handling
✅ Complete order processing
✅ Inventory management
✅ Conservation donation tracking
✅ Customer rewards system
✅ Email confirmations
✅ Success/error handling

**All you need to do is add your actual Stripe API keys and test!**
