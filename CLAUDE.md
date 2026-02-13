# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **La Pesqueria Outfitters**, an e-commerce platform for fishing apparel, gear, and outdoor clothing based in McAllen, TX. Built with Next.js 16, Prisma, and PostgreSQL (NeonDB).

## Essential Commands

### Development
```bash
npm run dev                # Start Next.js dev server on localhost:3000
npm run build             # Build for production (TypeScript errors will fail the build)
npm run start             # Start production server
npm run lint              # Run ESLint
```

### Database - Prisma
```bash
npx prisma generate       # Generate Prisma client from schema
npx prisma db push        # Push schema changes to database
npx prisma migrate dev    # Create and run migrations
npx prisma studio         # Open Prisma Studio (database GUI)
```

## Architecture

### Database

Uses **Prisma ORM** with a single PostgreSQL database (NeonDB serverless).

- **Schema**: `prisma/schema.prisma`
- **Client**: `src/lib/prisma.ts` (optimized singleton for NeonDB)
- **Re-export**: `src/lib/db.ts` re-exports from `prisma.ts` for backward compatibility
- Key tables: products, productVariants, orders, orderItems, inventoryTransactions, conservationDonations, users, customerRewards, analyticsEvents, emailLog, emailCampaigns, socialMediaPosts, cloverItems/Orders/Payments

### Route Groups

- `src/app/admin/` - Admin dashboard pages (protected by NextAuth)
- `src/app/` - Public-facing pages (product catalog, cart, checkout, conservation info)
- `src/app/api/` - API routes

### State Management

- **CartContext** (`src/context/CartContext.tsx`)
  - Client-side shopping cart using React Context + useReducer
  - Manages: items, subtotal, shipping ($5.95 if under $50), tax (8.25%), total
  - Cart state is not persisted (resets on page refresh)

### Auth

- **NextAuth** (`src/lib/auth.ts`) with credentials provider
- JWT strategy, 30-day sessions
- Roles: ADMIN, STAFF, CUSTOMER
- Admin panel at `/admin/login`
- **NEXTAUTH_SECRET** is required — app throws on startup without it

### Type System

- **Prisma types**: Auto-generated from `prisma/schema.prisma`
- **Application types**: `src/types/index.ts` - shared frontend/backend types

## Important Patterns

### Checkout Flow

- Checkout API: `POST /api/checkout/create-session`
- Validates cart with Zod, creates order via `createOrder()` (`src/lib/orders.ts`)
- Creates matching Clover order if `CLOVER_ACCESS_TOKEN` and `CLOVER_MERCHANT_ID` are configured
- Sends order confirmation email via Resend
- Returns `{ url: '/checkout/success?session_id={orderId}' }`

### Email System

- **Resend** for transactional emails (`src/lib/email.ts`)
- React Email templates in `src/emails/`:
  - `OrderConfirmation.tsx` - order confirmation
  - `AbandonedCartRecovery.tsx` - cart recovery
  - `CampaignEmail.tsx` - marketing campaigns
  - `StaffInviteEmail.tsx` - staff invitations
  - `WelcomeEmail.tsx` - new user welcome
- All use `OceanEmailLayout` wrapper component

### Clover POS Integration

- **Client**: `src/lib/clover.ts` - `createCloverClient()` reads from env vars
- **Sync page**: `/admin/clover-sync` - auto-detects env var credentials, one-click sync
- **API routes**: `/api/admin/clover/fetch`, `/api/admin/clover/import`, `/api/admin/clover/config`
- Credentials fall back to `CLOVER_ACCESS_TOKEN` and `CLOVER_MERCHANT_ID` env vars

### AI Marketing

- Social media post generation: `/api/admin/ai-marketing/generate-social-post` (Google Generative AI)
- Post scheduling: `/api/admin/ai-marketing/schedule-post` (stored in DB)
- Social media UI at `/admin/ai-marketing/social-media`

### Image Handling

- **Remote Images**: Configured for Unsplash and Cloudinary
  - See `next.config.ts` remotePatterns
- **Sharp**: Used for image processing

### Path Aliases

```typescript
@/*              // src/*
```

### Conservation Donations

Products track conservation info:
- 10% default donation percentage (configurable per product)
- `conservationDonations` table tracks pledged/donated amounts per order
- Regions: Rio Grande Valley, South Padre Island

### Product Variants

Products can have multiple variants with individual:
- Pricing, Stock levels, SKUs, Images
- Attributes (size, color, material)

Cart operations work at the variant level, not the product level.

### Database Connection

Environment variables required:
```env
DATABASE_URL=              # PostgreSQL connection string (NeonDB)
NEXTAUTH_SECRET=           # Required - app won't start without it
NEXTAUTH_URL=              # Base URL for auth callbacks

# Clover POS (optional)
CLOVER_ACCESS_TOKEN=
CLOVER_MERCHANT_ID=
CLOVER_APP_ID=
CLOVER_APP_SECRET=

# Email (optional - emails silently skip if not configured)
RESEND_API_KEY=

# AI Marketing (optional)
GOOGLE_GENERATIVE_AI_KEY=
```

## Development Workflow

### First-Time Setup

1. Install dependencies: `npm install`
2. Set up PostgreSQL database (NeonDB recommended)
3. Configure environment variables (`.env.local`)
4. Push schema: `npx prisma db push`
5. Start dev server: `npm run dev`
6. Access admin panel: `http://localhost:3000/admin`

### ESLint Configuration

- Uses Next.js TypeScript config
- Flat config format (ESLint 9+)

## Special Considerations

### Inventory Management

- `inventoryTransactions` table tracks all stock changes
- Transaction types: sale, restock, adjustment, reservation
- Links to orders for sales tracking
- Provides full audit trail

### Conservation Tracking

Each order can have associated conservation donations:
- Tracked by region (Rio Grande Valley, South Padre Island)
- Status: pledged -> donated
- Receipt URL storage for transparency

### Security

- PII (emails, passwords) is NOT logged in auth flows
- `ignoreBuildErrors` is `false` — TypeScript errors fail the build
- Placeholder data (phone numbers, etc.) has been removed from SEO schemas
