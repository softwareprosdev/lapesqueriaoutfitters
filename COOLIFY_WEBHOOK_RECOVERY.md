# 🚨 Stripe Webhook Orders Not Showing - Coolify Recovery Guide

## Current Situation

✅ Webhook secret configured: `whsec_LLeIjrugLVfJnfne5OCLbISrWXVITyOn`  
✅ Environment variable added to Coolify  
❌ Previous sales (couple of orders) not appearing in admin panel

## Root Cause

Your recent sales happened **before** the webhook was properly configured. Stripe processed the payments successfully, but the webhooks to create orders in your database likely failed due to:

1. Missing/incorrect webhook secret at the time
2. Container not restarted after adding env var
3. Webhook endpoint not accessible

## 🔧 Immediate Fix Steps

### Step 1: Verify Coolify Configuration

**In Coolify Dashboard:**

1. Go to your application
2. Click on **Environment Variables**
3. Verify `STRIPE_WEBHOOK_SECRET` is set to:
   ```
   whsec_LLeIjrugLVfJnfne5OCLbISrWXVITyOn
   ```
4. **CRITICAL**: Click **Restart** for the container to pick up the new env var

> **⚠️ Important**: Environment variables are only loaded when the container starts. Changes require a restart!

### Step 2: Check Application Logs

**In Coolify:**

1. Go to **Logs** tab
2. Look for webhook-related messages (will now show emoji-coded logs like 🔔 🔑 ✅)
3. Check for any errors in recent webhook attempts

Look for these log patterns:
- `🔔 Webhook received at:` - Webhook endpoint was hit
- `✅ Webhook signature verified successfully` - Secret is correct
- `✅ Order created successfully!` - Order was created in DB
- `❌` prefixes indicate errors

### Step 3: Check Stripe Dashboard for Failed Webhooks

**In Stripe Dashboard:**

1. Go to **Developers** → **Webhooks**
2. Click on your webhook endpoint (should be `https://yourdomain.com/api/webhooks/stripe`)
3. Scroll down to **Recent deliveries**
4. Look for **Failed** deliveries (they'll show red)

**For each failed webhook:**
1. Click on it to see the error
2. Click the **⋯** menu → **Resend**
3. This will retry the webhook with current configuration

## 📋 Recovery Options

### Option A: Resend Failed Webhooks (Recommended)

**Best for**: Recent orders (last few days)

1. In Stripe Dashboard → **Developers → Webhooks**
2. Find all failed `checkout.session.completed` events
3. Click **Resend** on each one
4. Watch Coolify logs to confirm orders are created

### Option B: Check Database Directly

**Access Coolify Database:**

```sql
-- Connect to your Postgres database in Coolify
-- Then run:

SELECT 
  id,
  "orderNumber",
  "customerEmail",
  "customerName",
  total,
  status,
  "createdAt"
FROM orders
ORDER BY "createdAt" DESC
LIMIT 10;
```

This shows if orders exist but admin panel isn't displaying them properly.

### Option C: Verify Webhook Endpoint

**Test webhook endpoint accessibility:**

```bash
curl -X POST https://yourdomain.com/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{}'
```

Should return: `{"error":"No signature provided"}`  
(This is good - means endpoint is reachable)

## 🧪 Test With New Order

1. Make a test purchase (use Stripe test mode if possible)
2. Watch Coolify logs in real-time
3. You should see:
   ```
   🔔 Webhook received at: ...
   🔑 Using webhook secret: whsec_LLeIjr...
   ✅ Webhook signature verified successfully
   💳 Processing checkout.session.completed
   📝 Creating order in database...
   ✅ Order created successfully!
   ```
4. Check admin panel - order should appear immediately

## 📊 Monitoring Checklist

After restarting container and verifying configuration:

- [ ] Container restarted with new `STRIPE_WEBHOOK_SECRET`
- [ ] Test webhook sends successfully (check logs)
- [ ] Admin panel displays new test order
- [ ] Failed webhooks resent from Stripe Dashboard
- [ ] Previous orders now appear in admin panel

## 🔍 Debugging Commands

**Check if webhook secret is loaded in container:**

In Coolify **Console** tab:
```bash
echo $STRIPE_WEBHOOK_SECRET
```
Should output: `whsec_LLeIjrugLVfJnfne5OCLbISrWXVITyOn`

**View recent application logs:**
```bash
# In Coolify, go to Logs tab and filter for:
# - "webhook"
# - "order"
# - "stripe"
```

## ⚠️ Common Issues

### Orders Still Not Showing After Container Restart

**Check:**
1. Is the admin panel fetching from correct database?
2. Are there any CORS or auth issues?
3. Try the diagnostic endpoint: `https://yourdomain.com/api/admin/orders/diagnostic`

### Webhook Signature Verification Fails

**Logs show:**
```
❌ Webhook signature verification failed
```

**Solutions:**
1. Verify you're using the **production** webhook secret (not test mode secret)
2. Double-check no extra spaces in Coolify env var
3. Ensure using correct secret for the webhook endpoint (each endpoint has unique secret)

### Metadata Errors

**Logs show:**
```
❌ No metadata found in checkout session
```

**Solution:**
This means checkout session wasn't created by your app. Verify checkout flow includes metadata.

## 📞 Next Steps If Still Not Working

1. Share Coolify logs from a webhook attempt
2. Share Stripe webhook delivery logs (screenshot)  
3. Run diagnostic endpoint and share results
4. Check if database connection is working

## 🎯 Prevention for Future

1. **Always restart container** after changing environment variables
2. **Monitor webhook health** in Stripe Dashboard regularly
3. **Set up alerts** for failed webhooks
4. **Test in development** before deploying webhook changes
