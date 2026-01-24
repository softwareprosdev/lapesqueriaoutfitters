# Coolify Deployment Checklist - ShennaStudio

Follow this checklist to deploy your application step-by-step.

## ✅ Pre-Deployment Checklist

### 1. VPS Information
- [ ] VPS IP Address: `_________________`
- [ ] SSH Access: `ssh root@your-vps-ip` (works)
- [ ] Coolify Installed: Yes/No
- [ ] Coolify Dashboard: `http://your-vps-ip:8000` (accessible)

### 2. Domain Information (Optional for now)
- [ ] Domain Name: `_________________`
- [ ] DNS Pointed to VPS: Yes/No (can do later)

### 3. GitHub Repository
- [ ] Repository Access: Public/Private
- [ ] Repository URL: `https://github.com/shennastudio/shennastudiowebsite.git`
- [ ] Branch: `main`

---

## 📋 Deployment Steps

### Step 1: Access Coolify Dashboard ✓

1. Open browser and go to:
   ```
   http://YOUR_VPS_IP:8000
   ```

2. Login with your Coolify admin credentials

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### Step 2: Create New Project

1. Click **"+ New"** button (top right)
2. Select **"Project"**
3. Enter details:
   - **Name**: `ShennaStudio`
   - **Description**: `Ocean-themed bracelet e-commerce store`
4. Click **"Create"**

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### Step 3: Add New Application

1. Inside the `ShennaStudio` project, click **"+ New Resource"**
2. Select **"Application"**
3. Choose **"Public Repository"** (or Private if needed)

**Configuration:**
- **Repository URL**: `https://github.com/shennastudio/shennastudiowebsite.git`
- **Branch**: `main`
- **Build Pack**: `Docker Compose`
- **Docker Compose Location**: `./docker-compose.yml`

4. Click **"Continue"** or **"Save"**

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### Step 4: Configure Application Settings

#### General Settings:
- **Name**: `shennastudio-app`
- **Port**: `3000`
- **Publish Directory**: `/` (leave default)

#### Build Settings:
- **Build Command**: (leave empty, handled by Dockerfile)
- **Docker Compose File**: `docker-compose.yml`
- **Docker Compose Service**: `app`

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### Step 5: Set Environment Variables

Go to: **Application** → **Environment Variables** → **+ Add**

#### Required Variables (MUST SET):

```bash
# Database
DB_USER=shennastudio
DB_PASSWORD=<generate-strong-password>
DB_NAME=shennastudio
DATABASE_URL=postgresql://shennastudio:<YOUR_DB_PASSWORD>@postgres:5432/shennastudio

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=<generate-32-char-secret>
NEXTAUTH_URL=http://YOUR_VPS_IP:3000

# Application
NEXT_PUBLIC_URL=http://YOUR_VPS_IP:3000
NODE_ENV=production
```

**Generate Secrets:**
```bash
# On your local machine or in Coolify terminal:
openssl rand -base64 32
```

#### Optional Variables (can add later):

```bash
# Stripe (leave empty for now)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Vercel Blob Storage (leave empty for now)
BLOB_READ_WRITE_TOKEN=

# Resend Email (leave empty for now)
RESEND_API_KEY=
```

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### Step 6: Deploy Application

1. Click **"Deploy"** or **"Restart"** button
2. Watch the build logs
3. Wait for deployment to complete (5-10 minutes)

**Expected Build Steps:**
- ✓ Cloning repository
- ✓ Building Docker image (multi-stage)
- ✓ Installing dependencies
- ✓ Generating Prisma client
- ✓ Building Next.js application
- ✓ Starting containers
- ✓ Running database migrations
- ✓ Application healthy

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### Step 7: Verify Deployment

1. **Check Application Status:**
   - In Coolify dashboard, status should be **"Running"** (green)

2. **Access Application:**
   ```
   http://YOUR_VPS_IP:3000
   ```
   - Should see the homepage

3. **Check Logs** (if issues):
   - Click **"Logs"** tab
   - Check both `app` and `postgres` services

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### Step 8: Seed Database (First Time Only)

1. In Coolify, go to **Application** → **Execute Command**
2. Select container: `app`
3. Run command:
   ```bash
   npx prisma db seed
   ```

**This creates:**
- ✓ Admin user: `admin@shennastudio.com` / `admin123`
- ✓ Sample categories
- ✓ Sample products

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### Step 9: Test Admin Panel

1. Navigate to:
   ```
   http://YOUR_VPS_IP:3000/admin/login
   ```

2. Login with:
   - **Email**: `admin@shennastudio.com`
   - **Password**: `admin123`

3. ⚠️ **IMPORTANT**: Change password immediately!
   - Go to **Account** → **Change Password**

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### Step 10: Add Domain & SSL (Optional - Can do later)

#### A. Point Domain to VPS:

In your domain registrar (Namecheap, GoDaddy, etc.):

**A Records:**
```
Type: A
Host: @
Value: YOUR_VPS_IP
TTL: 300

Type: A
Host: www
Value: YOUR_VPS_IP
TTL: 300
```

Wait 5-30 minutes for DNS propagation.

#### B. Configure in Coolify:

1. Go to **Application** → **Domains**
2. Click **"+ Add Domain"**
3. Enter: `yourdomain.com,www.yourdomain.com`
4. Click **"Save"**
5. Coolify will automatically request SSL from Let's Encrypt

#### C. Update Environment Variables:

```bash
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_URL=https://yourdomain.com
```

6. Click **"Restart"** application

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## 🔧 Troubleshooting

### Build Failed

**Check:**
- Repository URL is correct
- Branch name is `main`
- docker-compose.yml exists in repo

**Solution:**
- View build logs in Coolify
- Redeploy

### Database Connection Error

**Check:**
- `DATABASE_URL` format is correct
- `DB_PASSWORD` matches in both `DATABASE_URL` and `DB_PASSWORD`
- postgres service is healthy

**Solution:**
```bash
# In Coolify Execute Command (postgres container):
psql -U shennastudio -d shennastudio

# If this works, database is fine
```

### Application Not Accessible

**Check:**
- Port 3000 is exposed in docker-compose.yml
- Firewall allows port 3000
- Application status is "Running"

**Solution:**
```bash
# Check if app is listening:
docker logs shennastudio-app

# Check firewall:
sudo ufw status
sudo ufw allow 3000/tcp
```

### Seed Command Failed

**Check:**
- Database is connected
- Migrations have run

**Solution:**
```bash
# Run migrations first:
npx prisma migrate deploy

# Then seed:
npx prisma db seed
```

---

## 📊 Deployment Summary

Once complete, you'll have:

- ✅ Application running at `http://YOUR_VPS_IP:3000`
- ✅ Admin panel at `http://YOUR_VPS_IP:3000/admin`
- ✅ PostgreSQL database (persistent)
- ✅ Automatic restarts on failure
- ✅ Health checks monitoring
- ✅ Ready to add products!

**Optional additions:**
- Domain with SSL (free via Let's Encrypt)
- Stripe payment processing
- Email notifications (Resend)
- Image storage (Vercel Blob)

---

## 🎯 Next Steps After Deployment

1. **Change admin password**
2. **Upload real products** in admin panel
3. **Configure domain** (if not done)
4. **Set up Stripe** when ready for payments
5. **Configure email** for order confirmations
6. **Set up backups** (see main deployment guide)

---

## 🆘 Need Help?

**Check logs:**
- Coolify Dashboard → Logs tab
- Select service (app or postgres)
- Look for errors

**Common issues solved in:**
- [COOLIFY_DEPLOYMENT.md](./COOLIFY_DEPLOYMENT.md) - Troubleshooting section
- Coolify Discord: https://discord.gg/coolify

---

**Ready to start?** Begin with Step 1! ✨
