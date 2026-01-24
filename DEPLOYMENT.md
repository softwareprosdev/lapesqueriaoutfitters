# Coolify VPS Deployment Guide

## Prerequisites

- Coolify instance running on your VPS
- Domain name pointed to your VPS
- PostgreSQL database (can be managed by Coolify)

## Environment Variables

Set these in Coolify's environment configuration:

```env
# PostgreSQL Database (single database for all Payload CMS data)
# Coolify can provide managed PostgreSQL, or use the included postgres service
DATABASE_URL=postgresql://user:password@postgres:5432/shennastudio
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=shennastudio
DB_HOST=postgres
DB_PORT=5432

# Payload CMS Secret Key
# Generate with: openssl rand -base64 32
PAYLOAD_SECRET=your-secure-random-secret-minimum-32-chars

# Vercel Blob Storage (for product images and media uploads)
# Create a Vercel Blob store and get token from dashboard
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

# Stripe Payment Integration (optional)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Production URL
NEXT_PUBLIC_URL=https://yourdomain.com
```

## Deployment Steps

### Option 1: Using Coolify UI (Recommended)

1. **Create New Application in Coolify**
   - Go to your Coolify dashboard
   - Click "New Resource" → "Application"
   - Choose "Docker Compose" as deployment method

2. **Configure Git Repository**
   - Connect your GitHub/GitLab repository
   - Set branch to `main`
   - Enable auto-deploy on push (optional)

3. **Add Database Service**
   - In Coolify, create a new PostgreSQL service
   - Note the connection details
   - Or use the included `postgres` service in docker-compose.yml

4. **Set Environment Variables**
   - Go to Application → Environment Variables
   - Add all variables from the list above
   - Generate a secure `PAYLOAD_SECRET`: `openssl rand -base64 32`

5. **Configure Domain**
   - Add your domain in Coolify
   - Enable SSL/TLS (automatic via Let's Encrypt)
   - Set up automatic HTTPS redirect

6. **Deploy**
   - Click "Deploy"
   - Coolify will build and deploy your application
   - First deployment may take 5-10 minutes

7. **Run Migrations**
   - After first deployment, access container shell in Coolify
   - Run: `npm run payload:migrate`
   - Run: `npm run payload:seed` (creates admin user)

### Option 2: Manual Docker Deployment

```bash
# On your VPS, clone the repository
git clone <your-repo-url>
cd bead-bracelet-store

# Create .env file with production values
cp .env.example .env
nano .env

# Build and start services
docker-compose up -d

# Run migrations
docker-compose exec app npm run payload:migrate
docker-compose exec app npm run payload:seed
```

## Post-Deployment

1. **Access Admin Panel**
   - Navigate to `https://yourdomain.com/admin`
   - Login with credentials from seed script:
     - Email: `admin@shennastudio.com`
     - Password: `password` (change immediately!)

2. **Change Admin Password**
   - Go to admin panel → Users
   - Update admin user password
   - Update email to your real email

3. **Configure Vercel Blob Storage**
   - Create Vercel Blob Storage instance
   - Get `BLOB_READ_WRITE_TOKEN`
   - Update environment variable in Coolify
   - Redeploy application

4. **Add Products**
   - Use admin panel to add categories
   - Add products with variants
   - Upload product images
   - Set conservation percentages

5. **Test Checkout Flow**
   - Add products to cart
   - Complete test order
   - Verify order appears in admin panel
   - Check inventory tracking

## Health Checks

The application includes health check endpoints:

- **Application Health**: `GET /api/health`
- **Database Health**: Checked automatically via Docker healthcheck

## Monitoring

Coolify provides built-in monitoring:
- Application logs
- Resource usage (CPU, Memory, Disk)
- Deployment history
- Automatic restarts on failure

## Backup Strategy

### Database Backups (Automated in Coolify)

Coolify can automatically backup PostgreSQL:
- Set backup schedule in PostgreSQL service settings
- Backups stored in Coolify's backup location
- Supports retention policies

### Manual Backup

```bash
# Backup database
docker-compose exec postgres pg_dump -U $DB_USER $DB_NAME > backup_$(date +%Y%m%d).sql

# Backup media (if not using Vercel Blob)
docker-compose exec app tar -czf media_backup.tar.gz /app/media
```

### Restore

```bash
# Restore database
cat backup_20250101.sql | docker-compose exec -T postgres psql -U $DB_USER $DB_NAME
```

## Scaling Considerations

For higher traffic, consider:

1. **Horizontal Scaling**
   - Run multiple app containers behind load balancer
   - Use Coolify's scaling features

2. **Database Optimization**
   - Upgrade PostgreSQL instance size
   - Enable connection pooling (PgBouncer)
   - Regular VACUUM and ANALYZE

3. **CDN for Media**
   - Vercel Blob Storage includes global CDN
   - Or use Cloudflare for additional caching

4. **Caching Layer**
   - Add Redis for session storage
   - Cache product catalog queries
   - Implement ISR (Incremental Static Regeneration)

## Troubleshooting

### Application won't start

```bash
# Check logs in Coolify UI or via docker
docker-compose logs app

# Common issues:
# - Missing environment variables
# - Database connection failed
# - Port already in use
```

### Database connection errors

```bash
# Verify database is running
docker-compose ps

# Check database logs
docker-compose logs postgres

# Test connection
docker-compose exec app psql $DATABASE_URL
```

### Build failures

```bash
# Clear build cache in Coolify
# Or manually:
docker-compose down
docker system prune -a
docker-compose up --build
```

## Security Checklist

- [ ] Change default admin password
- [ ] Set strong `PAYLOAD_SECRET` (minimum 32 characters)
- [ ] Enable HTTPS/SSL in Coolify
- [ ] Set up firewall rules (Coolify handles this)
- [ ] Enable automatic security updates
- [ ] Regular database backups enabled
- [ ] Restrict database access to app container only
- [ ] Keep dependencies updated (`npm audit`)
- [ ] Monitor error logs for suspicious activity

## Support

For deployment issues:
- Coolify Docs: https://coolify.io/docs
- Payload CMS Docs: https://payloadcms.com/docs
- Next.js Docs: https://nextjs.org/docs

## Maintenance

### Update Application

```bash
# In Coolify: Enable auto-deploy from git
# Or manually:
git pull origin main
docker-compose down
docker-compose up -d --build
docker-compose exec app npm run payload:migrate
```

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Security audit
npm audit fix
```

## Cost Estimation

- **VPS**: $5-20/month (Digital Ocean, Hetzner, etc.)
- **Domain**: $10-15/year
- **Vercel Blob Storage**: Free tier (100GB, $0.15/GB after)
- **Coolify**: Free (self-hosted)
- **Total**: ~$7-25/month depending on traffic
