# Railway Deployment Guide

Complete guide for deploying ShennaStudio to Railway.com with PostgreSQL and Prisma migrations.

## Prerequisites

- Railway account (sign up at [railway.app](https://railway.app))
- Git repository pushed to GitHub
- Railway CLI installed: `npm i -g @railway/cli`

## Step-by-Step Deployment

### 1. Initial Setup

```bash
# Login to Railway
railway login

# Create new project
railway init

# Or link to existing project
railway link
```

### 2. Add PostgreSQL Database

**Option A: Via Railway Dashboard**
1. Go to your project dashboard
2. Click "New" → "Database" → "PostgreSQL"
3. Wait for database to provision
4. `DATABASE_URL` will be automatically set

**Option B: Via CLI**
```bash
railway add --database postgresql
```

### 3. Configure Environment Variables

Set required environment variables in Railway dashboard or via CLI:

```bash
# Generate a secure NextAuth secret
openssl rand -base64 32

# Set environment variables
railway variables set NEXTAUTH_SECRET="your-generated-secret-here"
railway variables set NEXTAUTH_URL="https://your-app.up.railway.app"
railway variables set NODE_ENV="production"
```

**Optional variables** (if using these services):
```bash
railway variables set BLOB_READ_WRITE_TOKEN="vercel_blob_token"
railway variables set STRIPE_SECRET_KEY="sk_live_..."
railway variables set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
railway variables set NEXT_PUBLIC_URL="https://your-app.up.railway.app"
```

### 4. Deploy Application

**Option A: Via GitHub Integration (Recommended)**
1. In Railway dashboard, connect your GitHub repository
2. Select the repository
3. Railway will automatically deploy on push to main branch

**Option B: Via CLI**
```bash
railway up
```

### 5. Monitor Build Process

The build process runs these steps automatically:
1. Install dependencies: `npm install`
2. Generate Prisma Client: `prisma generate`
3. Run migrations: `prisma migrate deploy`
4. Build Next.js: `npm run build`

Monitor the build:
```bash
railway logs --deployment
```

### 6. Seed Database (First Time Only)

After successful deployment, seed the database:

```bash
railway run npm run db:seed
```

This creates:
- Admin user: `admin@shennastudio.com` / `admin123`
- Sample categories: Ocean Life, Beach Vibes, Conservation
- Sample products with variants
- Conservation tracking records

### 7. Verify Deployment

1. **Frontend**: Visit `https://your-app.up.railway.app`
2. **Admin Login**: Visit `https://your-app.up.railway.app/admin`
3. **API Health**: Check `https://your-app.up.railway.app/api/products`

## Environment Variables Reference

| Variable | Required | Source | Description |
|----------|----------|--------|-------------|
| `DATABASE_URL` | ✅ | Railway | Auto-set by PostgreSQL service |
| `NEXTAUTH_SECRET` | ✅ | Manual | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | ✅ | Manual | Your Railway app URL |
| `NODE_ENV` | ✅ | Manual | Set to `production` |
| `BLOB_READ_WRITE_TOKEN` | ❌ | Vercel | For image uploads to Vercel Blob |
| `STRIPE_SECRET_KEY` | ❌ | Stripe | For payment processing |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ❌ | Stripe | Client-side Stripe key |
| `NEXT_PUBLIC_URL` | ❌ | Manual | Public facing URL |

## Database Migrations

### Automatic Migrations (During Deployment)

Migrations run automatically during build via the `railway:build` script:
```json
"railway:build": "prisma generate && prisma migrate deploy && npm run build"
```

### Manual Migration Commands

```bash
# View migration status
railway run npx prisma migrate status

# Deploy pending migrations
railway run npx prisma migrate deploy

# Regenerate Prisma Client
railway run npx prisma generate

# Open Prisma Studio (database GUI)
railway run npx prisma studio
```

### Creating New Migrations

When you modify `prisma/schema.prisma`:

1. **Locally** (for development):
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```

2. **Commit the migration files**:
   ```bash
   git add prisma/migrations/
   git commit -m "Add migration: your_migration_name"
   git push
   ```

3. **Railway will automatically**:
   - Detect the new migration files
   - Run `prisma migrate deploy` during build
   - Apply migrations to production database

## Continuous Deployment

### GitHub Integration Setup

1. In Railway dashboard, go to your service settings
2. Click "Connect GitHub Repo"
3. Select your repository
4. Configure build settings:
   - **Build Command**: `npm run railway:build` (auto-detected from `railway.json`)
   - **Start Command**: `npm run railway:start` (auto-detected from `railway.json`)

### Automatic Deployments

Push to your main branch to trigger deployment:
```bash
git push origin main
```

Railway will:
1. Pull latest code
2. Install dependencies
3. Run migrations
4. Build application
5. Deploy to production

## Troubleshooting

### Build Failures

**Error: "DATABASE_URL is not defined"**
- Solution: Ensure PostgreSQL service is added and `DATABASE_URL` is set
- Check: `railway variables` to list all variables

**Error: "Migration failed"**
- Solution: Check if migrations are in git
- Verify: `git ls-files prisma/migrations/`
- Manual fix: `railway run npx prisma migrate deploy`

**Error: "NEXTAUTH_SECRET is required"**
- Solution: Set the environment variable
- Command: `railway variables set NEXTAUTH_SECRET="$(openssl rand -base64 32)"`

### Runtime Errors

**500 Error on page load**
- Check logs: `railway logs`
- Verify database connection: `railway run npx prisma db execute --stdin`
- Ensure all required env vars are set

**Database connection timeout**
- Railway PostgreSQL should be in the same project
- Check if database is running in Railway dashboard
- Restart the service if needed

### Migration Issues

**"Migration already applied"**
- This is safe to ignore
- Railway tracks applied migrations in `_prisma_migrations` table

**"Migration failed: relation already exists"**
- Database may have been partially migrated
- Solution: Reset database (⚠️ destroys all data):
  ```bash
  railway run npx prisma migrate reset --force
  railway run npm run db:seed
  ```

## Monitoring & Logs

### View Application Logs
```bash
# Stream live logs
railway logs

# View deployment logs
railway logs --deployment

# View last 100 lines
railway logs --tail 100
```

### Database Monitoring

Railway dashboard provides:
- Connection count
- CPU usage
- Memory usage
- Storage usage
- Query performance metrics

## Scaling & Performance

### Horizontal Scaling
Railway automatically scales based on load.

### Database Connection Pooling
Prisma automatically handles connection pooling. Default settings work well for Railway.

### Environment-Specific Optimizations

Production settings in `next.config.ts`:
- Image optimization enabled
- React strict mode (useful for catching issues)
- Webpack caching for faster builds

## Security Checklist

- [x] `NEXTAUTH_SECRET` is set to a secure random value
- [x] `NODE_ENV=production` in Railway
- [x] Database credentials are Railway-managed
- [x] Admin password changed from default (`admin123`)
- [x] Stripe keys are production keys (if using payments)
- [x] CORS is properly configured
- [x] Rate limiting enabled (if implemented)

## Backup & Restore

### Database Backup
```bash
# Export database to SQL file
railway run pg_dump $DATABASE_URL > backup.sql
```

### Database Restore
```bash
# Import from SQL file
railway run psql $DATABASE_URL < backup.sql
```

## Cost Optimization

Railway pricing:
- **Hobby Plan**: $5/month + usage
- **PostgreSQL**: ~$5/month for 1GB
- **Bandwidth**: Generous free tier

Tips:
- Use Vercel Blob for images (reduces database storage)
- Enable Railway's sleep mode for staging environments
- Monitor usage in Railway dashboard

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: For application-specific issues
- Email: admin@shennastudio.com

## Quick Reference

```bash
# Deploy
railway up

# View logs
railway logs

# Run migrations
railway run npx prisma migrate deploy

# Seed database
railway run npm run db:seed

# Open Prisma Studio
railway run npx prisma studio

# Set environment variable
railway variables set KEY=value

# View all variables
railway variables

# Connect to database
railway connect postgres
```

## Next Steps After Deployment

1. **Change Admin Password**: Login at `/admin` and update from `admin123`
2. **Add Products**: Use admin panel or API to add your products
3. **Configure Stripe**: Set up payment processing (if using)
4. **Set up Domain**: Add custom domain in Railway settings
5. **Enable SSL**: Railway provides automatic SSL certificates
6. **Monitor Usage**: Check Railway dashboard for metrics
7. **Set up Alerts**: Configure Railway notifications for errors

---

**Deployment Status**: ✅ Ready for Railway Deployment

All configuration files are in place:
- `prisma/migrations/` - Database migration files
- `railway.json` - Railway build configuration
- `package.json` - Railway build scripts
- `.env.example` - Environment variable template
