# La Pesqueria Outfitters

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192?style=for-the-badge&logo=postgresql)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)

**Premium Fishing Apparel & Marine Gear for the Elite Angler**

*McAllen, TX*

</div>

---

## Overview

La Pesqueria Outfitters is a premium e-commerce platform for fishing apparel, performance gear, and outdoor accessories. Built for serious anglers and luxury yacht owners, the platform features an Elite Marine Dashboard with real-time tide data, weather conditions, and vessel tracking.

### Key Features

- **Premium E-commerce** - T-shirts, hats, hoodies, performance wear, and fishing accessories
- **Elite Marine Dashboard** - Real-time tides, weather, solunar data, and AIS vessel tracking
- **Clover POS Integration** - Sync inventory directly from your physical store
- **PWA Support** - Install as a native app on mobile devices
- **Admin Panel** - Full inventory, order, and customer management

---

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 16, React 19, TypeScript 5 |
| **Styling** | Tailwind CSS 4, Framer Motion |
| **Database** | PostgreSQL, Prisma ORM |
| **Auth** | NextAuth.js |
| **Payments** | Stripe |
| **Storage** | Cloudinary, Vercel Blob |
| **POS** | Clover API Integration |
| **PWA** | Serwist (Service Worker) |

---

## Quick Start

### Prerequisites

```bash
node >= 20.0.0
npm >= 10.0.0
postgresql >= 15
```

### Installation

```bash
# Clone the repository
git clone https://github.com/shennastudio/lapesqueriaoutfitters.git
cd lapesqueriaoutfitters

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Set up database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

Visit `http://localhost:3000`

---

## Environment Variables

Create a `.env.local` file with these variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/lapesqueria

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secure-secret-32-chars-minimum

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Cloudinary
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Clover POS (Optional)
CLOVER_APP_ID=your_app_id
CLOVER_APP_SECRET=your_app_secret
CLOVER_MERCHANT_ID=your_merchant_id
CLOVER_ACCESS_TOKEN=your_access_token
CLOVER_ENVIRONMENT=production

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_CLARITY_PROJECT_ID=your_clarity_id
```

---

## Project Structure

```
src/
├── app/
│   ├── admin/              # Admin panel pages
│   ├── api/                # API routes
│   │   ├── admin/          # Admin APIs
│   │   └── marine/         # Marine data APIs
│   ├── products/           # Product pages
│   └── page.tsx            # Homepage
├── components/
│   ├── admin/              # Admin components
│   ├── fishing-dashboard/  # Marine dashboard
│   │   ├── panels/         # Dashboard panels
│   │   └── hooks/          # Data hooks
│   └── ui/                 # UI components
├── lib/
│   ├── clover.ts           # Clover POS client
│   ├── marine/             # Marine data utilities
│   └── stripe.ts           # Stripe integration
└── types/
    └── marine.ts           # Marine data types
```

---

## Elite Marine Dashboard

The dashboard provides real-time marine data for serious anglers:

| Panel | Data Source |
|-------|-------------|
| **Yacht Navigation** | GPS, heading, speed |
| **Tides** | NOAA CO-OPS API |
| **Weather** | NOAA NWS + Open-Meteo |
| **Solunar** | Calculated moon phases |
| **Marina** | Berth availability |
| **VIP Forecast** | AI-powered fishing predictions |

### Data Sources

- **NOAA CO-OPS** - Tide predictions and water levels
- **NOAA NWS** - Weather forecasts and marine alerts
- **Open-Meteo** - Wave height, wind, and marine conditions
- **AIS** - Real-time vessel tracking (WebSocket)

---

## Clover POS Sync

Sync your physical store inventory with the online store:

1. Navigate to `/admin/clover-sync`
2. Enter your Clover API Token and Merchant ID
3. Click "Fetch Clover Data"
4. Select what to import (items, categories, customers, orders)
5. Click "Import Selected Data"

### Getting Clover Credentials

| Credential | Location |
|------------|----------|
| API Token | Clover Dashboard → Settings → API Tokens |
| Merchant ID | Found in your Clover Dashboard URL |
| App ID/Secret | Clover Developer Dashboard |

---

## Admin Panel

Access: `/admin/login`

### Features

- **Dashboard** - Sales analytics, revenue charts
- **Products** - Full CRUD with image uploads
- **Orders** - Order tracking and fulfillment
- **Customers** - Customer management and segments
- **Inventory** - Stock levels and alerts
- **Blog** - Content management
- **Clover Sync** - POS integration
- **Settings** - Site configuration

---

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes
npm run db:migrate   # Run migrations
npm run db:studio    # Prisma Studio GUI
```

---

## Deployment

### Coolify VPS

1. Create a new service in Coolify
2. Connect to the GitHub repository
3. Add environment variables
4. Deploy

### Required Environment Variables for Production

```env
DATABASE_URL
NEXTAUTH_URL
NEXTAUTH_SECRET
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
CLOUDINARY_URL
```

---

## PWA Support

The site works as a Progressive Web App:

- **Offline Support** - Cached marine data available offline
- **Install Prompt** - Add to home screen on mobile
- **Push Notifications** - (Coming soon)

---

## License

Proprietary. All rights reserved.

---

## Support

- **Issues**: [GitHub Issues](https://github.com/shennastudio/lapesqueriaoutfitters/issues)
- **Location**: McAllen, TX

---

<div align="center">

**La Pesqueria Outfitters** - *Premium Fishing Gear for the Elite Angler*

</div>
