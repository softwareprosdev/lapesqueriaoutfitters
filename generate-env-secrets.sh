#!/bin/bash

# Generate Environment Variable Secrets for ShennaStudio Coolify Deployment

echo "=================================="
echo "ShennaStudio Environment Variables"
echo "=================================="
echo ""

# Generate secrets
DB_PASSWORD=$(openssl rand -base64 32 | tr -d '\n')
NEXTAUTH_SECRET=$(openssl rand -base64 32 | tr -d '\n')

echo "Copy these values into Coolify Environment Variables:"
echo ""
echo "# =================================="
echo "# REQUIRED VARIABLES"
echo "# =================================="
echo ""
echo "DATABASE_URL=postgresql://shennastudio:${DB_PASSWORD}@postgres:5432/shennastudio"
echo "DB_USER=shennastudio"
echo "DB_PASSWORD=${DB_PASSWORD}"
echo "DB_NAME=shennastudio"
echo ""
echo "NEXTAUTH_SECRET=${NEXTAUTH_SECRET}"
echo "NEXTAUTH_URL=https://shennastudio.com"
echo ""
echo "NEXT_PUBLIC_URL=https://shennastudio.com"
echo "NODE_ENV=production"
echo ""
echo "# =================================="
echo "# OPTIONAL VARIABLES (leave empty for now)"
echo "# =================================="
echo ""
echo "STRIPE_SECRET_KEY="
echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="
echo "STRIPE_WEBHOOK_SECRET="
echo "BLOB_READ_WRITE_TOKEN="
echo "RESEND_API_KEY="
echo ""
echo "=================================="
echo "✅ Secrets generated successfully!"
echo "=================================="
