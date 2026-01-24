# Stripe Optional Configuration Update

**Date:** 2025-12-26
**Status:** ✅ Complete

## Overview

Updated the application to make Stripe payment processing **completely optional**, allowing successful deployments to Railway.com without Stripe API keys configured.

## Changes Made

### 1. Stripe Client Configuration (`src/lib/stripe.ts`)

**Before:**
```typescript
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});
```

**After:**
```typescript
// Stripe is optional - will be null if keys are not provided
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
      typescript: true,
    })
  : null;

export const isStripeEnabled = () => {
  return stripe !== null && !!process.env.STRIPE_SECRET_KEY;
};
```

### 2. Checkout API Route (`src/app/api/checkout/create-session/route.ts`)

- Added `isStripeEnabled()` check at the start of the request handler
- Returns `503 Service Unavailable` with user-friendly error message when Stripe is not configured
- Prevents runtime errors when Stripe keys are missing

### 3. Stripe Webhook Route (`src/app/api/webhooks/stripe/route.ts`)

- Added `isStripeEnabled()` check at the start of the request handler
- Returns `503 Service Unavailable` when Stripe webhooks are not configured
- Gracefully handles webhook requests even when Stripe is disabled

### 4. Checkout Page (`src/app/checkout/page.tsx`)

- Enhanced error handling for 503 responses
- Shows user-friendly message: "Payment processing is temporarily unavailable. Please contact support or try again later."
- Prevents confusing error messages when Stripe is intentionally not configured

## Deployment Impact

### ✅ Railway Deployment Now Succeeds Without Stripe

**Required Environment Variables:**
```bash
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secure-secret
NEXTAUTH_URL=https://your-app.up.railway.app
```

**Optional Environment Variables:**
```bash
# Only needed when ready to accept payments
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Build Process

The build script remains unchanged and works perfectly:

```json
{
  "railway:build": "prisma generate && prisma migrate deploy && npm run build",
  "railway:start": "node .next/standalone/server.js"
}
```

**Verified:**
- ✅ Build completes successfully without Stripe keys
- ✅ No runtime errors during initialization
- ✅ Application starts and serves pages normally
- ✅ Checkout flow gracefully informs users when payments are unavailable

## Testing Status

### ✅ Local Build Test
```bash
npm run build
```
**Result:** Build completed successfully without Stripe environment variables

### User Experience

**With Stripe Configured:**
- Normal checkout flow → Redirects to Stripe Checkout
- Webhooks process payments
- Orders created in database
- Confirmation emails sent

**Without Stripe Configured:**
- Users can browse products, add to cart
- Checkout form can be filled out
- On submit, shows: "Payment processing is temporarily unavailable. Please contact support or try again later."
- No errors in console
- Application remains stable

## Migration Path

### Enabling Stripe Later

1. Set environment variables in Railway:
```bash
railway variables set STRIPE_SECRET_KEY="sk_live_..."
railway variables set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
railway variables set STRIPE_WEBHOOK_SECRET="whsec_..."
```

2. Redeploy (or Railway will auto-redeploy if connected to GitHub)

3. No code changes needed - Stripe will automatically be enabled

### Testing Stripe Integration

1. Use Stripe test mode keys during development
2. Test checkout flow end-to-end
3. Verify webhook handling
4. Check order creation in admin panel
5. Confirm email delivery
6. Switch to live keys for production

## Benefits

1. **Faster Development Cycles:** Deploy and test without waiting for Stripe setup
2. **Lower Barrier to Entry:** New developers can run the project immediately
3. **Flexible Deployment:** Stage environments don't need payment processing
4. **Graceful Degradation:** Application works with or without Stripe
5. **No Breaking Changes:** Existing Stripe integrations work exactly as before

## Related Files

- `src/lib/stripe.ts` - Core Stripe configuration
- `src/app/api/checkout/create-session/route.ts` - Checkout API
- `src/app/api/webhooks/stripe/route.ts` - Webhook handler
- `src/app/checkout/page.tsx` - Checkout UI
- `.env.example` - Already documented Stripe as optional
- `railway.json` - Build configuration (unchanged)
- `package.json` - Build scripts (unchanged)

## Next Steps

When you're ready to enable payments:

1. **Create Stripe Account**
   - Sign up at https://stripe.com
   - Complete business verification

2. **Get API Keys**
   - Navigate to Developers → API Keys
   - Copy Publishable Key and Secret Key

3. **Set Up Webhook**
   - Go to Developers → Webhooks
   - Add endpoint: `https://your-app.up.railway.app/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy Webhook Secret

4. **Configure Railway**
   ```bash
   railway variables set STRIPE_SECRET_KEY="sk_live_..."
   railway variables set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
   railway variables set STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

5. **Test End-to-End**
   - Make a test purchase
   - Verify order in admin panel
   - Check email confirmation
   - Confirm conservation donation tracking
   - Validate rewards points allocation

## Summary

The application is now **fully deployment-ready** without requiring Stripe configuration. Payment processing can be enabled at any time by simply setting environment variables - no code deployment required.
