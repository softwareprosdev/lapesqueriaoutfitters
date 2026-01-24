# Vercel Blob Storage Setup Guide

## Step 1: Get Your Complete Token from Vercel

You've provided the store ID: `store_jeUiMbhPMsE1L96A`

Now you need to get the complete read/write token:

### Option A: From Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Storage** tab
4. Click on **Blob** storage
5. Find your store: `jeUiMbhPMsE1L96A`
6. Click **"Show Token"** or **"Create Token"**
7. Copy the **complete token** (it should look like: `vercel_blob_rw_jeUiMbhPMsE1L96A_XXXXXXXXXXXXXXXXXX`)

### Option B: Create New Token via CLI

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Get your blob token
vercel env pull
```

## Step 2: Update Your Local Environment

1. Open `.env.local`
2. Replace the placeholder token:

```env
# Replace this line:
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_jeUiMbhPMsE1L96A_YourActualTokenHere

# With your actual token:
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_jeUiMbhPMsE1L96A_XXXXXXXXXXXXXXXXXX
```

## Step 3: Set Token in Railway (for Production)

```bash
# Option 1: Using Railway CLI
railway variables set BLOB_READ_WRITE_TOKEN=vercel_blob_rw_jeUiMbhPMsE1L96A_XXXXXXXXXXXXXXXXXX

# Option 2: Via Railway Dashboard
# 1. Go to your Railway project
# 2. Click on your service
# 3. Go to "Variables" tab
# 4. Click "New Variable"
# 5. Name: BLOB_READ_WRITE_TOKEN
# 6. Value: vercel_blob_rw_jeUiMbhPMsE1L96A_XXXXXXXXXXXXXXXXXX
# 7. Click "Add"
```

## Step 4: Restart Your Development Server

After adding the token to `.env.local`:

```bash
# Stop your dev server (Ctrl+C)
# Then restart
npm run dev
```

## Step 5: Test Image Upload

1. Go to `http://localhost:3000/admin/login`
2. Login with your credentials
3. Go to **Products** > **Add Product**
4. Scroll to **Product Images** section
5. Drag and drop an image
6. You should see:
   - Upload progress spinner
   - Success! Image appears in the gallery
   - Image URL starts with: `https://jeuimbhpmse1l96a.public.blob.vercel-storage.com/`

## Troubleshooting

### Error: "Unauthorized" or "Invalid token"
- ✅ Make sure you copied the **complete token** including the prefix `vercel_blob_rw_`
- ✅ Check for extra spaces before or after the token
- ✅ Restart your dev server after adding the token

### Error: "Failed to upload"
- ✅ Check your internet connection
- ✅ Verify the token is correct in `.env.local`
- ✅ Make sure the file is under 5MB
- ✅ Check file format (JPEG, PNG, WebP, GIF only)

### Error: "BLOB_READ_WRITE_TOKEN is not defined"
- ✅ The `.env.local` file must be in the project root
- ✅ Restart your dev server
- ✅ Check that the variable name is exactly: `BLOB_READ_WRITE_TOKEN`

## Your Blob Storage Info

**Store ID:** `store_jeUiMbhPMsE1L96A`
**Public URL:** `https://jeuimbhpmse1l96a.public.blob.vercel-storage.com`
**Token Format:** `vercel_blob_rw_jeUiMbhPMsE1L96A_[SECRET_PART]`

## Security Notes

⚠️ **NEVER commit `.env.local` to Git!** (It's already in `.gitignore`)
⚠️ Keep your token secret - it gives full access to your blob storage
⚠️ Use different tokens for development and production if possible

## Next Steps

Once configured:
1. ✅ Upload images work locally
2. ✅ Add token to Railway variables
3. ✅ Deploy to Railway
4. ✅ Test uploads in production

Need help? The token is in your Vercel dashboard under Storage > Blob!
