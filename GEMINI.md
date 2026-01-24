# GEMINI.md

## Project Overview

**ShennaStudio (bead-bracelet-store)** is a production-ready e-commerce platform built with Next.js 15, specialized for selling handcrafted ocean-themed bracelets. It features a comprehensive admin panel, customer-facing storefront, and supports marine conservation initiatives (10% of sales).

**Key Features:**
*   **Storefront:** Product catalog with variants (size, color, material), real-time cart, and checkout via Stripe.
*   **Admin Panel:** Full CRUD for products, orders, categories, and site settings. Includes analytics, inventory management, and **AI-powered tools**.
*   **Blog:** SEO-optimized blog with AI content generation (Gemini, Claude, Hugging Face) and rich text editing.
*   **Authentication:** Role-based access control (Admin, Staff, Customer) using NextAuth.js.
*   **Database:** PostgreSQL managed via Prisma ORM.
*   **Deployment:** Configured for Railway (primary) and Coolify (self-hosted).

## Tech Stack

*   **Framework:** Next.js 15 (App Router)
*   **Language:** TypeScript
*   **UI/Styling:** React 19, Tailwind CSS 4, Shadcn UI, Lucide React
*   **Database:** PostgreSQL, Prisma ORM
*   **Authentication:** NextAuth.js v4
*   **State Management:** Zustand
*   **Forms:** React Hook Form + Zod
*   **Payments:** Stripe
*   **Storage:** Vercel Blob (images)
*   **Email:** Resend / Nodemailer
*   **AI:** Google Gemini, Anthropic Claude, Hugging Face Inference

## Project Structure

```
/
├── prisma/                 # Database schema and seed scripts
│   ├── schema.prisma       # Main database schema
│   └── seed.ts             # Initial data seeding
├── scripts/                # Utility scripts
│   ├── seed-analytics.ts   # Seed analytics data
│   └── seed-blog.ts        # Seed blog posts
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── (auth)/         # Authentication routes (login, register)
│   │   ├── (customer)/     # Customer account pages
│   │   ├── admin/          # Admin panel pages (protected)
│   │   │   ├── blog/       # Blog management
│   │   │   └── ai-features # AI tools (Blog Generator)
│   │   ├── api/            # API routes
│   │   └── page.tsx        # Homepage
│   ├── components/         # React components
│   │   ├── admin/          # Admin-specific components
│   │   ├── ui/             # Reusable UI components (Shadcn)
│   │   └── ...             # Feature components (Cart, Products, etc.)
│   ├── lib/                # Shared utilities
│   │   ├── auth.ts         # NextAuth configuration
│   │   ├── db.ts           # Prisma client instance
│   │   ├── stripe.ts       # Stripe configuration
│   │   └── ai/             # AI service integrations
│   └── middleware.ts       # Route protection middleware
├── public/                 # Static assets
└── ...config files         # next.config.ts, tailwind.config.ts, etc.
```

## Building and Running

### Prerequisites
*   Node.js >= 20.0.0
*   PostgreSQL >= 15

### Key Commands

*   **Install Dependencies:** `npm install`
*   **Development Server:** `npm run dev` (Runs on `http://localhost:3000`)
*   **Production Build:** `npm run build`
*   **Start Production Server:** `npm run start`
*   **Linting:** `npm run lint`

### Database Operations

*   **Generate Client:** `npm run db:generate` (Run after schema changes)
*   **Push Schema:** `npm run db:push` (Updates DB schema without migrations)
*   **Seed Data:** `npm run db:seed` (Populates DB with initial admin/products)
*   **Seed Blog:** `npx tsx scripts/seed-blog.ts`
*   **Seed Analytics:** `npx tsx scripts/seed-analytics.ts`
*   **Prisma Studio:** `npm run db:studio` (GUI for database management)

## Development Conventions

*   **Authentication:** Routes under `/admin` are protected by `src/middleware.ts`. Users must have `ADMIN` or `STAFF` role.
*   **Data Fetching:** Server Components are preferred for data fetching where possible.
*   **Styling:** Use Tailwind CSS utility classes. Components are built using Shadcn UI patterns.
*   **Type Safety:** Strict TypeScript usage. Database types are inferred from Prisma client. Zod is used for runtime validation (forms, API inputs).
*   **Deployment:** The project includes configuration for Railway (`railway.json`) and generic Docker deployment (`Dockerfile`, `docker-compose.yml`).

## Environment Variables

Required variables (see `.env.example`):
*   `DATABASE_URL`: PostgreSQL connection string.
*   `NEXTAUTH_SECRET`: Secret for session encryption.
*   `NEXTAUTH_URL`: Canonical URL of the site.
*   `BLOB_READ_WRITE_TOKEN`: Vercel Blob token for image uploads.
*   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `STRIPE_SECRET_KEY`: Stripe keys.
*   `RESEND_API_KEY`: Email service key.
*   `GOOGLE_GENERATIVE_AI_KEY`: Gemini API key (optional).
*   `ANTHROPIC_API_KEY`: Claude API key (optional).
*   `HUGGINGFACE_API_KEY`: Hugging Face API key (optional).