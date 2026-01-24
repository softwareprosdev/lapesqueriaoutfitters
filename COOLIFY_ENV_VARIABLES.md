# ShennaStudio - Coolify Environment Variables

**Using Coolify's managed PostgreSQL database**

## Required Environment Variables

Copy these exactly into Coolify's Environment Variables section:

```bash
# Database Configuration (using Coolify's PostgreSQL)
DATABASE_URL=postgres://postgres:12MW4ekYKTFHnEnPlld3CZmI1uZwhf1tUbedE3bWW7tJmEHfWZByY5mHFATH3xib@ckos4cos8k84sg4s40kgcw84:5432/postgres

# NextAuth Authentication
NEXTAUTH_SECRET=KxzvUvSez4FHokgLUPob5QnGKAd6U0oXyQFAYp01FO4=
NEXTAUTH_URL=https://shennastudio.com

# Application Settings
NEXT_PUBLIC_URL=https://shennastudio.com
NODE_ENV=production
```

## Optional Variables (leave empty for now)

```bash
# Stripe Payment Processing
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=

# Resend Email
RESEND_API_KEY=
```

## Notes

- Using Coolify's managed PostgreSQL database
- Database host: `ckos4cos8k84sg4s40kgcw84` (internal Coolify service)
- Database: `postgres` (default database)
- NEXTAUTH_SECRET: Pre-generated secure secret
- Domain: shennastudio.com

## Deployment Configuration

**Build Pack:** Dockerfile (NOT Docker Compose)
**Dockerfile Path:** `./Dockerfile`
**Port:** 3000
**Domains:** `shennastudio.com,www.shennastudio.com`
