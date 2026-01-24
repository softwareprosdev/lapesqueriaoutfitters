# 🔧 Coolify Environment Variables Checklist

## Production Environment Variables Required

Make sure ALL of these environment variables are set in your Coolify dashboard:

### ✅ Stripe (Payment Processing)
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... # Your live publishable key
STRIPE_SECRET_KEY=sk_live_...                  # Your live secret key
STRIPE_WEBHOOK_SECRET=whsec_...                # Your PRODUCTION webhook secret (see STRIPE_PRODUCTION_READY.md)
```

### ✅ Database (PostgreSQL)
```bash
DATABASE_URL=postgresql://user:password@host:5432/dbname
POSTGRES_URL=postgresql://user:password@host:5432/dbname
```

### ✅ NextAuth (Authentication)
```bash
NEXTAUTH_URL=https://your-production-domain.com  # Your actual production URL
NEXTAUTH_SECRET=your-secure-random-string        # Generate: openssl rand -base64 32
```

### ✅ Payload CMS
```bash
PAYLOAD_SECRET=your-secure-random-string         # Generate: openssl rand -base64 32
PAYLOAD_API_URL=https://your-production-domain.com/api  # Your actual production URL
```

### ✅ Vercel Blob Storage (Image Uploads)
```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

### ✅ Node Environment
```bash
NODE_ENV=production
```

### ⚠️ CRITICAL: Production-Specific Variables

These MUST be different from development:

1. **NEXTAUTH_URL**: Must match your production domain (not localhost)
   - ❌ BAD: `http://localhost:3000`
   - ✅ GOOD: `https://shennastudio.com`

2. **PAYLOAD_API_URL**: Must match your production domain (not localhost)
   - ❌ BAD: `http://localhost:3000/api`
   - ✅ GOOD: `https://shennastudio.com/api`

3. **STRIPE_WEBHOOK_SECRET**: Must be from PRODUCTION webhook endpoint
   - ❌ BAD: Using development webhook secret
   - ✅ GOOD: Created new webhook in Stripe Dashboard for production URL

---

## 🔒 How to Generate Secure Secrets

For `NEXTAUTH_SECRET` and `PAYLOAD_SECRET`, generate strong random strings:

```bash
# Run this command twice to generate two different secrets
openssl rand -base64 32
```

Copy the output and use it for each secret.

---

## ✅ Verification Steps

After setting environment variables in Coolify:

1. **Check Environment Variables are Loaded**
   - Coolify should show all variables in the dashboard
   - Restart application after adding/changing variables

2. **Check Application Logs**
   - Look for Stripe initialization messages
   - Verify no "environment variable missing" errors
   - Check database connection successful

3. **Test Stripe Checkout**
   - Visit production site
   - Add product to cart
   - Start checkout
   - Should redirect to Stripe (not show error)

4. **Test Webhook Delivery**
   - Complete a test purchase
   - Check Stripe Dashboard → Webhooks
   - Should show successful delivery to production URL
   - Check order created in database

---

## 🚨 Common Issues

### Issue: "Payment processing is not currently available"

**Cause**: Stripe environment variables not loaded

**Fix**:
1. Verify `STRIPE_SECRET_KEY` is set in Coolify
2. Verify key starts with `sk_live_` (not `sk_test_`)
3. Restart application in Coolify
4. Check application logs for Stripe errors

### Issue: Webhook not receiving events

**Cause**: `STRIPE_WEBHOOK_SECRET` mismatch or wrong URL

**Fix**:
1. Create NEW webhook endpoint in Stripe Dashboard for production URL
2. Copy the NEW webhook secret
3. Update `STRIPE_WEBHOOK_SECRET` in Coolify with NEW secret
4. Restart application
5. Test with a payment

### Issue: NextAuth redirect errors

**Cause**: `NEXTAUTH_URL` doesn't match production domain

**Fix**:
1. Set `NEXTAUTH_URL=https://your-actual-domain.com`
2. Must use HTTPS (not HTTP)
3. Must match your actual domain exactly
4. Restart application

### Issue: Payload CMS API errors

**Cause**: `PAYLOAD_API_URL` not set or incorrect

**Fix**:
1. Set `PAYLOAD_API_URL=https://your-actual-domain.com/api`
2. Must match your production domain
3. Must include `/api` at the end
4. Restart application

---

## 📝 Quick Reference

**Your Production Setup:**

```bash
# Base URL
NEXTAUTH_URL=https://YOUR-DOMAIN.com
PAYLOAD_API_URL=https://YOUR-DOMAIN.com/api

# Stripe (Live Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... # From production webhook endpoint

# Database
DATABASE_URL=postgresql://...
POSTGRES_URL=postgresql://...

# Secrets
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
PAYLOAD_SECRET=<generate with: openssl rand -base64 32>

# Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

# Environment
NODE_ENV=production
```

---

## ✅ Final Checklist

Before going live:

- [ ] All environment variables set in Coolify
- [ ] `NEXTAUTH_URL` matches production domain
- [ ] `PAYLOAD_API_URL` matches production domain + `/api`
- [ ] Stripe keys are LIVE keys (`pk_live_`, `sk_live_`)
- [ ] Production webhook created in Stripe Dashboard
- [ ] `STRIPE_WEBHOOK_SECRET` from PRODUCTION webhook
- [ ] `NEXTAUTH_SECRET` and `PAYLOAD_SECRET` are strong random strings
- [ ] Application deployed and running
- [ ] SSL certificate active (HTTPS)
- [ ] Test checkout completes successfully
- [ ] Webhook delivers events successfully
- [ ] Order created in database
- [ ] Confirmation email sent

---

## 🎉 Ready to Launch

Once all environment variables are set and verified, your production site is ready to accept real customer payments!

**Next Steps:**
1. Complete the checklist above
2. Follow the Stripe webhook setup in `STRIPE_PRODUCTION_READY.md`
3. Test checkout with a small transaction
4. Monitor logs and Stripe Dashboard
5. Start accepting orders! 🌊💳
