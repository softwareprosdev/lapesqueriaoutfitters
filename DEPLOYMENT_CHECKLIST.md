# Railway Deployment Checklist

Quick checklist for deploying ShennaStudio to Railway.com

## Pre-Deployment

- [ ] Railway account created
- [ ] Railway CLI installed: `npm i -g @railway/cli`
- [ ] Git repository pushed to GitHub
- [ ] All local changes committed

## Railway Setup

- [ ] Login to Railway: `railway login`
- [ ] Create/link project: `railway init` or `railway link`
- [ ] Add PostgreSQL database (via dashboard or CLI)
- [ ] Verify `DATABASE_URL` is set: `railway variables`

## Environment Variables

Generate NextAuth secret:
```bash
openssl rand -base64 32
```

Set required variables:
- [ ] `NEXTAUTH_SECRET` - ⚠️ Use the generated secret above
- [ ] `NEXTAUTH_URL` - Your Railway URL (e.g., `https://your-app.up.railway.app`)
- [ ] `NODE_ENV` - Set to `production`

Optional variables (if using):
- [ ] `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage
- [ ] `STRIPE_SECRET_KEY` - Stripe payments
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe client
- [ ] `NEXT_PUBLIC_URL` - Public URL

## Deployment

- [ ] Connect GitHub repo in Railway dashboard (recommended)
  - OR deploy via CLI: `railway up`
- [ ] Monitor build: `railway logs --deployment`
- [ ] Verify build completes successfully

## Post-Deployment

- [ ] Seed database: `railway run npm run db:seed`
- [ ] Test frontend: `https://your-app.up.railway.app`
- [ ] Test admin panel: `https://your-app.up.railway.app/admin`
- [ ] Login with default credentials:
  - Email: `admin@shennastudio.com`
  - Password: `admin123`
- [ ] **Change admin password immediately**

## Verification

- [ ] Home page loads without errors
- [ ] Product pages display correctly
- [ ] Cart functionality works
- [ ] Admin panel is accessible
- [ ] Database connection successful
- [ ] API endpoints respond: `/api/products`

## Security

- [ ] Admin password changed from default
- [ ] `NEXTAUTH_SECRET` is secure random string (not default)
- [ ] Stripe keys are production keys (not test keys)
- [ ] Environment variables are set in Railway (not in code)

## Optional Configuration

- [ ] Custom domain added in Railway settings
- [ ] SSL certificate configured (automatic with Railway)
- [ ] Monitoring/alerts set up
- [ ] Backup schedule configured

## Troubleshooting

If build fails:
```bash
# Check logs
railway logs --deployment

# Verify variables
railway variables

# Test database connection
railway run npx prisma migrate status
```

If runtime errors occur:
```bash
# View application logs
railway logs

# Check database
railway connect postgres
```

## Quick Commands Reference

```bash
# Deploy
railway up

# View logs
railway logs

# Run migrations
railway run npx prisma migrate deploy

# Seed database
railway run npm run db:seed

# Set variable
railway variables set KEY=value

# View all variables
railway variables
```

## Success Indicators

✅ Build completed without errors
✅ Application accessible at Railway URL
✅ Database seeded successfully
✅ Admin login works
✅ Products display on frontend
✅ Cart functionality operational

## Support Resources

- Railway Docs: https://docs.railway.app
- Prisma Docs: https://www.prisma.io/docs
- Next.js Docs: https://nextjs.org/docs
- Project Issues: GitHub Issues

---

**Ready for Deployment**: ✅

All migration files and configuration are in place. Follow this checklist for a smooth deployment!
