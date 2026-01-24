# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **La Pesqueria Outfitters**, an e-commerce platform for fishing apparel, gear, and outdoor clothing based in McAllen, TX. Built with Next.js 16, Prisma, and PostgreSQL.

## Essential Commands

### Development
```bash
npm run dev                # Start Next.js dev server on localhost:3000
npm run build             # Build for production
npm run start             # Start production server
npm run lint              # Run ESLint
```

### Database - Drizzle ORM
```bash
npm run db:generate       # Generate migrations from schema
npm run db:push          # Push schema changes to database
npm run db:migrate       # Run migrations
npm run db:studio        # Open Drizzle Studio (database GUI)
```

### Database - Payload CMS
```bash
npm run payload:generate  # Generate TypeScript types from collections
npm run payload:migrate   # Run Payload migrations
npm run payload:seed      # Seed admin user (email: admin@lapesqueria.com)
```

## Architecture

### Dual Database System

This project uses **two separate database systems** that coexist:

1. **Drizzle ORM** (`src/lib/db/schema.ts`)
   - Custom application tables for products, orders, inventory
   - Used by the public-facing Next.js frontend
   - Schema includes: products, productVariants, inventoryTransactions, categories, productCategories, orders, orderItems, conservationDonations, adminUsers

2. **Payload CMS** (`payload-config.ts` + `src/collections/`)
   - Headless CMS with admin panel at `/admin`
   - Separate PostgreSQL tables managed by Payload
   - Collections: Users, Products, Categories, Orders, Media
   - Provides REST API at `/api/*`

**IMPORTANT**: These are **not** integrated. Changes in one system do not automatically sync to the other. The frontend currently uses temporary data while the Payload admin panel manages its own dataset.

### Route Groups

- `src/app/(payload)/` - Payload CMS admin interface routes
  - Protected route group
  - Contains admin panel at `/admin`

- `src/app/` - Public-facing pages
  - Product catalog, cart, checkout, conservation info
  - Uses React Server Components

### State Management

- **CartContext** (`src/context/CartContext.tsx`)
  - Client-side shopping cart using React Context + useReducer
  - Manages: items, subtotal, shipping ($5.95 if under $50), tax (8.25%), total
  - Cart state is not persisted (resets on page refresh)

### Key Collections (Payload CMS)

All collections in `src/collections/`:

- **Products**: Supports variants (size, color, material), conservation info (donation percentage), multiple images, SKU management
- **Categories**: Product categorization with slugs
- **Orders**: Stripe integration hooks, order tracking, customer info
- **Media**: Cloud storage via Vercel Blob, automatic image resizing
- **Users**: Role-based access (admin, staff, customer)

### Type System

- **Drizzle types**: Inferred from `src/lib/db/schema.ts`
- **Payload types**: Auto-generated in `payload-types.ts` via `npm run payload:generate`
- **Application types**: `src/types/index.ts` - shared frontend/backend types

## Important Patterns

### Image Handling

- **Remote Images**: Configured for Unsplash and Vercel Blob Storage
  - See `next.config.ts` remotePatterns
  - Payload Media collection uploads to Vercel Blob
- **Sharp**: Used for image processing in Payload

### Path Aliases

```typescript
@/*              // src/*
@payload-config  // payload-config.ts
```

### Conservation Donations

Products track conservation info:
- 10% default donation percentage (configurable per product)
- Conservation focus field for specific causes
- `conservationDonations` table tracks pledged/donated amounts per order

### Product Variants

Products can have multiple variants with individual:
- Pricing
- Stock levels
- SKUs
- Images
- Attributes (size, color, material)

Cart operations work at the variant level, not the product level.

### Database Connection

Environment variables required:
```env
# Payload CMS
PAYLOAD_SECRET=dev-secret-key-change-in-production
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=5432
DB_NAME=

# Drizzle ORM
POSTGRES_URL=
DATABASE_URL=

# Vercel Blob Storage
IMAGES_READ_WRITE_TOKEN=
```

## Development Workflow

### First-Time Setup

1. Install dependencies: `npm install`
2. Set up PostgreSQL database
3. Configure environment variables (`.env.local`)
4. Run Payload migrations: `npm run payload:migrate`
5. Seed admin user: `npm run payload:seed`
6. Start dev server: `npm run dev`
7. Access admin panel: `http://localhost:3000/admin`

### Working with Payload

- Admin panel changes auto-generate types on save
- Use `npm run payload:generate` to manually regenerate types
- Collections use role-based access control
- Admin/staff can create/edit products; customers view their orders only

### ESLint Configuration

- Uses Next.js TypeScript config
- ESLint errors ignored during builds (`ignoreDuringBuilds: true`)
- Flat config format (ESLint 9+)

## Special Considerations

### Migration Path

The codebase is in transition:
- Temporary product data may exist in `@/data/products` (not currently active)
- Payload CMS provides the content management layer
- Frontend components expect Drizzle ORM types
- Eventual integration between systems is needed

### Stripe Integration

- Orders collection has `stripePaymentIntentId` field
- Integration hooks are set up but implementation needed
- Payment flow not yet complete

### Inventory Management

- `inventoryTransactions` table tracks all stock changes
- Transaction types: sale, restock, adjustment, reservation
- Links to orders for sales tracking
- Provides full audit trail

### Conservation Tracking

Each order can have associated conservation donations:
- Linked to conservation organizations
- Tracked by region (Rio Grande Valley, South Padre Island)
- Status: pledged → donated
- Receipt URL storage for transparency
