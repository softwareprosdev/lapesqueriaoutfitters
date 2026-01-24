# Quick Start Deployment Guide

Choose your deployment platform:

## 🚀 Coolify (Recommended - Self-Hosted)

**Pros:**
- ✅ Full control over infrastructure
- ✅ Cost-effective ($12-30/month)
- ✅ Own your data
- ✅ No vendor lock-in
- ✅ Automated deployments

**Setup Time:** 30-45 minutes

👉 **[Complete Coolify Guide](./COOLIFY_DEPLOYMENT.md)**

### Quick Steps:

1. **Get a VPS** (DigitalOcean, Hetzner, Vultr)
   - 2GB RAM minimum
   - Ubuntu 22.04

2. **Install Coolify**
   ```bash
   curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
   ```

3. **Add Application**
   - Repository: `https://github.com/shennastudio/shennastudiowebsite.git`
   - Build Pack: Docker Compose
   - Domain: `yourdomain.com`

4. **Set Environment Variables**
   - Copy from `.env.production.example`
   - Set required variables
   - Deploy!

5. **Access Your Site**
   - `https://yourdomain.com`
   - Admin: `https://yourdomain.com/admin/login`

---

## 🚂 Railway (Alternative - Managed)

**Pros:**
- ✅ Easier setup
- ✅ Managed infrastructure
- ✅ Auto-scaling

**Cons:**
- ❌ Higher cost ($20-50/month)
- ❌ Less control
- ❌ Occasional service issues

**Setup Time:** 10-15 minutes

👉 **[Railway Guide](./RAILWAY_DEPLOYMENT.md)** (if it exists)

---

## Comparison

| Feature | Coolify | Railway |
|---------|---------|---------|
| **Monthly Cost** | $12-30 | $20-50+ |
| **Setup Difficulty** | Medium | Easy |
| **Control** | Full | Limited |
| **Scaling** | Manual | Automatic |
| **Data Ownership** | You own it | Vendor controlled |
| **Best For** | Production apps | Quick prototypes |

---

## Recommended: Coolify

For ShennaStudio, we recommend **Coolify** because:

1. **Cost Savings**: $12/month vs $50+/month
2. **Full Control**: Your VPS, your rules
3. **Data Privacy**: All data stays on your server
4. **No Surprises**: Predictable monthly costs
5. **Learning**: Understand your infrastructure

**Ready to deploy?** → [Coolify Deployment Guide](./COOLIFY_DEPLOYMENT.md)

---

## Need Help?

- **Coolify Issues**: Check [COOLIFY_DEPLOYMENT.md](./COOLIFY_DEPLOYMENT.md) troubleshooting section
- **Application Issues**: Create a GitHub issue
- **General Questions**: Check the [README.md](./README.md)
