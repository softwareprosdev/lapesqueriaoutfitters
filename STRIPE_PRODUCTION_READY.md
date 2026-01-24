# ✅ Stripe Production Deployment Guide

## Status: PRODUCTION READY

Your Stripe checkout system is **fully configured and ready for live transactions**. All code properly uses environment variables and dynamic URLs - no hardcoded localhost references.

---

## 🔑 Environment Variables (Already Set in Coolify)

You've already added these to your Coolify VPS:

```bash
# Production Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... # Your live publishable key
STRIPE_SECRET_KEY=sk_live_...                  # Your live secret key
STRIPE_WEBHOOK_SECRET=whsec_...                # Your live webhook secret
```

✅ **Verified**: All code uses these environment variables correctly.

---

## 🌐 Critical: Webhook URL Setup

### Step 1: Get Your Production Domain

Your production domain from Coolify (example: `https://shennastudio.com` or whatever your actual domain is).

### Step 2: Create Production Webhook Endpoint

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Enter webhook URL:
   ```
   https://YOUR-PRODUCTION-DOMAIN.com/api/webhooks/stripe
   ```
   Example: `https://shennastudio.com/api/webhooks/stripe`

4. Select events to listen for:
   - ✅ `checkout.session.completed` (REQUIRED)
   - ✅ `payment_intent.succeeded` (Backup)
   - ✅ `payment_intent.payment_failed` (Error handling)

5. Click **"Add endpoint"**

6. Copy the **Signing secret** (starts with `whsec_...`)

7. Update `STRIPE_WEBHOOK_SECRET` in Coolify with this NEW production webhook secret

### Step 3: Verify Webhook is Active

- In Stripe Dashboard → Webhooks
- You should see your production endpoint with status: **Active**
- The endpoint URL should match your production domain

---

## ✅ Production Code Verification

All critical files are production-ready:

### 1. **Stripe Config** (`src/lib/stripe.ts`)
```typescript
// ✅ Uses environment variables
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  : null;
```

### 2. **Create Checkout Session** (`src/app/api/checkout/create-session/route.ts`)
```typescript
// ✅ Dynamic URLs - no hardcoded localhost
success_url: `${request.headers.get('origin')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
cancel_url: `${request.headers.get('origin')}/cart`,
```

### 3. **Webhook Handler** (`src/app/api/webhooks/stripe/route.ts`)
```typescript
// ✅ Uses environment variable for webhook secret
event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

### 4. **Success Page** (`src/app/checkout/success/page.tsx`)
```typescript
// ✅ Clears cart, shows confirmation, no hardcoded URLs
```

---

## 🧪 Testing Production Checkout

### Test with Live Cards

Once deployed, test the full checkout flow:

1. **Add Product to Cart**
   - Navigate to `/products`
   - Click "Add to Cart" on any product
   - Verify cart shows in header

2. **Start Checkout**
   - Click "Checkout" in cart
   - Fill in shipping information
   - Click "Proceed to Payment"

3. **Complete Payment on Stripe**
   - You'll be redirected to Stripe's hosted checkout page
   - Use a **REAL credit card** (you'll be charged)
   - OR use Stripe test cards in **test mode**:
     - Test Card: `4242 4242 4242 4242`
     - Expiry: Any future date (e.g., `12/34`)
     - CVC: Any 3 digits (e.g., `123`)
     - ZIP: Any 5 digits (e.g., `12345`)

4. **Verify Success Flow**
   - After payment, should redirect to `/checkout/success`
   - Cart should be cleared
   - Order confirmation email should be sent
   - Order should be created in database

---

## 🔍 Verification Checklist

Use this checklist to verify everything works in production:

### Before First Customer Purchase

- [ ] Live Stripe API keys added to Coolify environment variables
- [ ] Production webhook endpoint created in Stripe Dashboard
- [ ] Webhook secret updated in Coolify
- [ ] Application deployed and running on production domain
- [ ] SSL certificate active (HTTPS)
- [ ] Environment variables loaded (check Coolify logs)

### Test Checkout Flow

- [ ] Can add products to cart
- [ ] Cart persists in localStorage
- [ ] Checkout page loads and shows order summary
- [ ] Can fill in shipping information
- [ ] "Proceed to Payment" redirects to Stripe
- [ ] Stripe checkout page loads correctly
- [ ] Can complete payment (test mode)
- [ ] Redirects to success page after payment
- [ ] Cart is cleared after checkout

### Test Webhook Processing

- [ ] Webhook receives `checkout.session.completed` event
- [ ] Order is created in database with correct details
- [ ] Order items are saved correctly
- [ ] Conservation donation record is created (10% of subtotal)
- [ ] Customer rewards points are awarded
- [ ] Inventory is deducted from product variants
- [ ] Order confirmation email is sent to customer

### Monitor First Transactions

- [ ] Check Stripe Dashboard → Payments for successful charges
- [ ] Check Stripe Dashboard → Webhooks for event delivery status
- [ ] Check database for order records
- [ ] Check email delivery (customer confirmations)
- [ ] Check server logs for any errors

---

## 🛡️ Security Features (Already Implemented)

Your checkout system includes production-grade security:

1. **Webhook Signature Verification**
   ```typescript
   event = stripe.webhooks.constructEvent(
     body,
     signature,
     process.env.STRIPE_WEBHOOK_SECRET
   );
   ```
   ✅ Prevents webhook spoofing attacks

2. **User Authentication**
   ```typescript
   const session = await getServerSession(authOptions);
   if (!session?.user) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }
   ```
   ✅ Only authenticated users can checkout

3. **Environment Variable Protection**
   - API keys stored in environment variables (not in code)
   - `.env.local` in `.gitignore`
   - Coolify manages production secrets securely

4. **HTTPS Enforcement**
   - Stripe requires HTTPS for webhooks
   - All API calls use HTTPS
   - Coolify provides SSL certificates

---

## 📊 What Happens on Production Checkout

### Customer Journey:
1. Browses products → Adds to cart
2. Clicks "Checkout" → Fills shipping info
3. Clicks "Proceed to Payment" → Redirected to Stripe
4. Enters payment details → Completes purchase
5. Redirected to success page → Cart cleared

### Server Journey:
1. **POST /api/checkout/create-session**
   - Validates user session
   - Creates Stripe Checkout Session with metadata
   - Returns URL to Stripe hosted page

2. **Customer Pays on Stripe**
   - Stripe processes payment
   - Charge appears in Stripe Dashboard

3. **POST /api/webhooks/stripe** (Stripe sends webhook)
   - Verifies webhook signature
   - Extracts order metadata
   - Creates Order in database
   - Creates OrderItems
   - Creates ConservationDonation (10% of subtotal)
   - Awards CustomerReward points
   - Creates PointTransaction
   - Deducts inventory via InventoryTransaction
   - Updates ProductVariant stock
   - Sends order confirmation email
   - Returns 200 OK to Stripe

---

## 🚨 Troubleshooting Production Issues

### Issue: "Payment processing is not currently available"

**Causes:**
- Stripe environment variables not loaded in Coolify
- Invalid API keys
- App not restarted after adding environment variables

**Solution:**
1. Verify environment variables in Coolify dashboard
2. Check that keys start with `pk_live_` and `sk_live_`
3. Restart application in Coolify
4. Check application logs for Stripe initialization errors

### Issue: Webhook not receiving events

**Causes:**
- Webhook URL doesn't match production domain
- Webhook secret is incorrect
- Firewall blocking Stripe webhook requests
- SSL certificate invalid

**Solution:**
1. Verify webhook URL in Stripe Dashboard matches production domain
2. Check webhook secret in Coolify matches Stripe
3. Verify SSL certificate is valid (must be HTTPS)
4. Check Stripe Dashboard → Webhooks → Event delivery logs
5. Look for failed webhook attempts with error messages

### Issue: Order created but email not sent

**Causes:**
- Email service not configured (Resend API key missing)
- Email service rate limit
- Invalid customer email address

**Solution:**
1. Check email configuration in Coolify (`RESEND_API_KEY`)
2. Review email service logs
3. Verify email doesn't block order creation (webhook still returns 200)
4. Check `console.error` logs for email errors

### Issue: Inventory not deducted

**Causes:**
- Database transaction error
- Variant ID mismatch
- Stock already at zero

**Solution:**
1. Check database logs for transaction errors
2. Verify product variant IDs in order metadata
3. Check `InventoryTransaction` table for failed transactions
4. Review webhook processing logs

---

## 📈 Monitoring Production

### Stripe Dashboard
- **Payments**: Monitor successful charges
- **Webhooks**: Check event delivery status
- **Customers**: View customer payment methods
- **Disputes**: Handle chargebacks (rare)

### Application Logs
Monitor Coolify logs for:
```bash
# Successful orders
"Order created successfully: <order-id>"
"Order confirmation email sent to: <email>"

# Webhook errors
"Webhook signature verification failed"
"Error processing checkout session"
"Failed to send order confirmation email"
```

### Database
Check these tables regularly:
- `Order` - All customer orders
- `OrderItem` - Line items per order
- `ConservationDonation` - Donation tracking
- `CustomerReward` - Points awarded
- `InventoryTransaction` - Stock changes

---

## 💰 Additional Stripe Features (Optional)

Once basic checkout is working, you can enable:

### 1. **Apple Pay & Google Pay**
Enable in Stripe Dashboard → Settings → Payment methods:
- Apple Pay (for iOS/macOS users)
- Google Pay (for Android/Chrome users)
- Link (Stripe's 1-click checkout)

### 2. **Subscription Billing** (Future)
For recurring products:
- Monthly subscription boxes
- Membership tiers
- Automatic rebilling

### 3. **Stripe Radar** (Fraud Prevention)
Automatically enabled on all accounts:
- Machine learning fraud detection
- Custom fraud rules
- 3D Secure authentication

### 4. **Customer Portal**
Let customers manage their own:
- Payment methods
- Order history
- Subscription cancellations

---

## 📝 Summary

### ✅ What's Already Done

- ✅ Complete Stripe integration code
- ✅ Environment variable configuration
- ✅ Dynamic production URLs (no hardcoded localhost)
- ✅ Secure webhook signature verification
- ✅ User authentication required
- ✅ Full order processing pipeline
- ✅ Inventory management
- ✅ Conservation donation tracking
- ✅ Customer rewards system
- ✅ Email confirmations
- ✅ Success/error handling
- ✅ Production-ready security

### 🔧 What You Need to Do

1. **Set up production webhook in Stripe Dashboard**
   - URL: `https://YOUR-DOMAIN.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy webhook secret

2. **Update webhook secret in Coolify**
   - Add/update `STRIPE_WEBHOOK_SECRET` environment variable
   - Use the NEW webhook secret from production endpoint

3. **Deploy and test**
   - Deploy application to Coolify
   - Test checkout with test card
   - Verify order creation
   - Monitor webhook delivery

---

## 🎉 You're Ready for Live Transactions!

Your Stripe checkout system is **production-ready**. Once you complete the webhook setup, customers can make real purchases on your live site.

**Next Steps:**
1. Create production webhook endpoint in Stripe
2. Update webhook secret in Coolify
3. Test checkout flow
4. Monitor first transactions
5. Start accepting payments! 🌊💳
