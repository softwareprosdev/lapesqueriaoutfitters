// Prisma Client Singleton - Optimized for NeonDB Serverless
// Prevents multiple instances in development (hot reload)

import { PrismaClient } from '@prisma/client';
import { neonConfig } from '@neondatabase/serverless';

// Configure Neon for serverless environments
neonConfig.fetchConnectionCache = true;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create optimized Prisma client for NeonDB
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Only log errors in production, minimal logging in development
    log: process.env.NODE_ENV === 'development'
      ? ['error', 'warn']
      : ['error'],
    // Optimize connection settings
    datasourceUrl: process.env.DATABASE_URL,
  });

// Cache the client in development to prevent connection churn
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
