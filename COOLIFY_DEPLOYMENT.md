# Coolify Deployment Guide - ShennaStudio

Complete guide to deploying ShennaStudio on your own VPS using Coolify.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [VPS Setup](#vps-setup)
3. [Coolify Installation](#coolify-installation)
4. [Application Deployment](#application-deployment)
5. [Environment Variables](#environment-variables)
6. [Domain & SSL Setup](#domain--ssl-setup)
7. [Database Management](#database-management)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### What You Need

- **VPS Server** (Minimum requirements):
  - 2 GB RAM
  - 2 vCPUs
  - 20 GB Storage
  - Ubuntu 22.04 or newer

- **Domain Name** pointed to your VPS IP
- **GitHub Account** with access to the repository
- **SSH Access** to your VPS

### Recommended VPS Providers

- **DigitalOcean** - $12/month for 2GB RAM droplet
- **Hetzner** - €4.51/month for CX22
- **Vultr** - $12/month for 2GB RAM
- **Linode** - $12/month for 2GB RAM

---

## VPS Setup

### 1. Create Your VPS

Choose your provider and create a new server with:
- **OS**: Ubuntu 22.04 LTS
- **Size**: 2GB RAM minimum (4GB recommended)
- **Add SSH key** for secure access

### 2. Initial Server Configuration

```bash
# SSH into your server
ssh root@your-vps-ip

# Update system packages
apt update && apt upgrade -y

# Create a new user (optional but recommended)
adduser shenna
usermod -aG sudo shenna

# Set up firewall
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 8000/tcp  # Coolify dashboard
ufw enable
```

---

## Coolify Installation

### 1. Install Coolify

```bash
# Run the Coolify installation script
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

# Wait for installation to complete (5-10 minutes)
```

### 2. Access Coolify Dashboard

1. Open your browser and navigate to:
   ```
   http://your-vps-ip:8000
   ```

2. **Set up admin account**:
   - Create your admin email and password
   - Remember these credentials!

3. **Complete setup wizard**:
   - Skip team creation (optional)
   - Configure your first server

---

## Application Deployment

### 1. Add New Project in Coolify

1. Click **"+ New"** → **"Project"**
2. Name it: `ShennaStudio`
3. Click **"Create"**

### 2. Add New Resource

1. Click **"+ New Resource"**
2. Select **"Application"**
3. Choose **"Public Repository"** or **"Private Repository"**

### 3. Configure Git Repository

**For Public Repository:**
```
Repository URL: https://github.com/shennastudio/shennastudiowebsite.git
Branch: main
```

**For Private Repository:**
- Add your GitHub Personal Access Token
- Or configure SSH deploy key

### 4. Select Build Pack

- **Build Pack**: Docker Compose
- **Docker Compose Location**: `./docker-compose.yml`
- **Base Directory**: `/` (root)

### 5. Configure Application Settings

**General Settings:**
- **Name**: `shennastudio-app`
- **Domains**: `yourdomain.com,www.yourdomain.com`
- **Port**: `3000` (application port)
- **Health Check Path**: `/` (optional)

**Build Settings:**
- **Docker Compose File**: `docker-compose.yml`
- **Build Command**: (leave empty, handled by Dockerfile)

---

## Environment Variables

### 1. In Coolify Dashboard

Navigate to: **Your Project** → **Application** → **Environment Variables**

### 2. Add Required Variables

Click **"+ Add"** for each variable:

#### Database (Required)
```bash
DB_USER=shennastudio
DB_PASSWORD=<generate-strong-password>
DB_NAME=shennastudio
DATABASE_URL=postgresql://shennastudio:<your-password>@postgres:5432/shennastudio
```

#### Authentication (Required)
```bash
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=<your-secret-32-chars>
NEXTAUTH_URL=https://yourdomain.com
```

#### Application (Required)
```bash
NEXT_PUBLIC_URL=https://yourdomain.com
NODE_ENV=production
```

#### Optional Services

**Stripe (Payment Processing)**
```bash
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Vercel Blob (Image Storage)**
```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

**Resend (Email)**
```bash
RESEND_API_KEY=re_...
```

### 3. Generate Strong Passwords

```bash
# On your local machine or server:
openssl rand -base64 32
```

---

## Domain & SSL Setup

### 1. Point Domain to VPS

In your domain registrar (Namecheap, GoDaddy, etc.):

**A Records:**
```
Type: A
Host: @
Value: your-vps-ip
TTL: 300

Type: A
Host: www
Value: your-vps-ip
TTL: 300
```

**Wait 5-30 minutes for DNS propagation**

### 2. Enable SSL in Coolify

1. Go to **Application** → **Domains**
2. Coolify will automatically request SSL from Let's Encrypt
3. SSL certificate will auto-renew every 90 days

**Verify SSL:**
```bash
https://yourdomain.com
```

---

## Database Management

### Access PostgreSQL Database

#### Option 1: Coolify Terminal

1. Go to **Application** → **Logs**
2. Click **"Execute Command"**
3. Select **postgres** container
4. Run:
```bash
psql -U shennastudio -d shennastudio
```

#### Option 2: SSH + Docker

```bash
# SSH into VPS
ssh shenna@your-vps-ip

# Access database
docker exec -it shennastudio-db psql -U shennastudio -d shennastudio
```

### Useful Database Commands

```sql
-- List all tables
\dt

-- Check products
SELECT id, name, "basePrice" FROM "Product" LIMIT 10;

-- Check orders
SELECT id, total, status FROM "Order" LIMIT 10;

-- Check admin users
SELECT id, email, role FROM "AdminUser";
```

### Backup Database

```bash
# Create backup
docker exec shennastudio-db pg_dump -U shennastudio shennastudio > backup_$(date +%Y%m%d).sql

# Restore backup
docker exec -i shennastudio-db psql -U shennastudio shennastudio < backup_20250127.sql
```

---

## Application Management

### Deploy New Changes

1. **Push to GitHub**:
   ```bash
   git push origin main
   ```

2. **Trigger Deployment in Coolify**:
   - Go to your application
   - Click **"Restart"** or **"Redeploy"**
   - Or enable **"Automatic Deployment"** for auto-deploys on git push

### View Logs

```bash
# In Coolify Dashboard:
Application → Logs → Select service (app or postgres)

# Via SSH:
docker logs -f shennastudio-app
docker logs -f shennastudio-db
```

### Restart Services

```bash
# In Coolify: Click "Restart"

# Via SSH:
cd /data/coolify/applications/your-app-id
docker-compose restart app
```

### Scale Resources

If you need more power:

1. **Upgrade VPS** at your provider
2. **Restart application** in Coolify
3. Resources auto-adjust

---

## Initial Setup After Deployment

### 1. Seed Admin User

```bash
# SSH into VPS
ssh shenna@your-vps-ip

# Access app container
docker exec -it shennastudio-app sh

# Run seed script
npx prisma db seed

# Exit container
exit
```

### 2. Access Admin Panel

```
https://yourdomain.com/admin/login

Email: admin@shennastudio.com
Password: admin123

⚠️ IMPORTANT: Change this password immediately!
```

### 3. Upload Products

1. Login to admin panel
2. Go to **Products** → **Add Product**
3. Upload images, set prices, add variants
4. Publish products

---

## Monitoring & Maintenance

### Health Checks

Coolify automatically monitors:
- Container health
- HTTP responses
- Database connectivity

**View Status:**
- Dashboard shows green/red indicators
- Click on service for detailed metrics

### Automatic Backups

**Set up automated backups:**

1. In Coolify: **Application** → **Backup**
2. Configure backup schedule
3. Choose backup destination (S3, local, etc.)

**Manual Backup Script:**
```bash
#!/bin/bash
# Save as /root/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR

# Backup database
docker exec shennastudio-db pg_dump -U shennastudio shennastudio > $BACKUP_DIR/db_$DATE.sql

# Backup uploads (if using local storage)
docker cp shennastudio-app:/app/public/uploads $BACKUP_DIR/uploads_$DATE

# Keep only last 7 backups
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "uploads_*" -mtime +7 -delete
```

**Add to crontab:**
```bash
crontab -e

# Add this line for daily backups at 2 AM:
0 2 * * * /root/backup.sh
```

---

## Troubleshooting

### Application Won't Start

**Check logs:**
```bash
docker logs shennastudio-app
```

**Common issues:**
- Missing environment variables
- Database connection failed
- Build errors

**Solution:**
1. Verify all required env vars are set
2. Check DATABASE_URL format
3. Ensure postgres container is healthy

### Database Connection Error

```bash
# Check postgres is running:
docker ps | grep postgres

# Check connection:
docker exec shennastudio-db pg_isready -U shennastudio

# Restart postgres:
docker restart shennastudio-db
```

### Out of Memory

```bash
# Check memory usage:
free -h

# Check Docker stats:
docker stats

# Solution: Upgrade VPS to 4GB RAM
```

### SSL Certificate Issues

1. Verify domain DNS is correct:
   ```bash
   dig yourdomain.com
   ```

2. Check firewall allows ports 80 and 443:
   ```bash
   sudo ufw status
   ```

3. Regenerate certificate in Coolify dashboard

### 502 Bad Gateway

```bash
# Application is down or not responding
docker logs shennastudio-app

# Restart application:
docker restart shennastudio-app
```

---

## Performance Optimization

### 1. Enable Caching

Add to environment variables:
```bash
NEXT_CACHE_MODE=force-cache
```

### 2. Use CDN (Optional)

Configure Cloudflare:
1. Add domain to Cloudflare
2. Update nameservers
3. Enable proxy (orange cloud)
4. Configure caching rules

### 3. Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_slug ON "Product"(slug);
CREATE INDEX IF NOT EXISTS idx_order_user ON "Order"("userId");
```

---

## Updating Coolify

```bash
# SSH into VPS
ssh shenna@your-vps-ip

# Update Coolify
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

---

## Security Best Practices

### 1. Firewall Configuration

```bash
# Only allow necessary ports
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 8000/tcp  # Coolify (restrict to your IP if possible)
ufw default deny incoming
ufw default allow outgoing
ufw enable
```

### 2. Restrict Coolify Dashboard

```bash
# Option 1: Use SSH tunnel
ssh -L 8000:localhost:8000 shenna@your-vps-ip

# Access at: http://localhost:8000

# Option 2: IP whitelist in firewall
ufw allow from YOUR.IP.ADDRESS to any port 8000
```

### 3. Keep System Updated

```bash
# Run weekly:
apt update && apt upgrade -y
```

### 4. Change Default Admin Credentials

After first deployment:
1. Login to `/admin`
2. Change password from default `admin123`
3. Consider creating new admin user and deleting default

---

## Cost Estimates

### Monthly Costs

**Minimum Setup:**
- VPS (2GB RAM): $12/month
- Domain: $12/year (~$1/month)
- **Total: ~$13/month**

**Recommended Setup:**
- VPS (4GB RAM): $24/month
- Domain: $12/year (~$1/month)
- Backups (optional): $5/month
- **Total: ~$30/month**

**With Optional Services:**
- Above + Vercel Blob: $0-20/month (usage-based)
- Above + Resend Email: $0-20/month (usage-based)
- **Total: ~$30-70/month**

### Cost Comparison

- **Coolify (Self-hosted)**: $12-30/month + full control
- **Railway**: $20-50/month + easier setup
- **Vercel + Database**: $40-100/month

---

## Support & Resources

### Official Documentation

- **Coolify Docs**: https://coolify.io/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs

### Community

- **Coolify Discord**: https://discord.gg/coolify
- **GitHub Issues**: https://github.com/coollabsio/coolify/issues

### Getting Help

1. Check application logs in Coolify
2. Search Coolify documentation
3. Ask in Coolify Discord
4. Create GitHub issue if needed

---

## Summary

You now have:
- ✅ Full control over your infrastructure
- ✅ Automated deployments from GitHub
- ✅ Auto-renewing SSL certificates
- ✅ Database backups
- ✅ Cost-effective hosting (~$12-30/month)
- ✅ Scalable architecture

**Next Steps:**
1. Deploy to Coolify
2. Set up your domain
3. Upload products in admin panel
4. Configure optional services (Stripe, email, etc.)
5. Launch your store! 🚀

---

**Need help?** Check the troubleshooting section or reach out to the Coolify community!
