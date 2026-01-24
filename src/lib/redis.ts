/**
 * Redis Client Configuration
 *
 * Provides a singleton Redis client for:
 * - Session caching
 * - Rate limiting
 * - Cache for API responses
 * - Real-time data syncing
 */

import Redis from 'ioredis';

// Parse Redis URL or use defaults
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Create singleton Redis client
let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError(err) {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    });

    redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    redis.on('connect', () => {
      console.log('Redis connected successfully');
    });
  }

  return redis;
}

// Convenience export for direct usage
export const redisClient = getRedisClient();

// ============================================================================
// CACHE UTILITIES
// ============================================================================

/**
 * Cache key prefixes for organization
 */
export const CACHE_KEYS = {
  SESSION: 'session:',
  USER: 'user:',
  PRODUCT: 'product:',
  CATEGORY: 'category:',
  CART: 'cart:',
  RATE_LIMIT: 'rate_limit:',
  ANALYTICS: 'analytics:',
  INVENTORY: 'inventory:',
} as const;

/**
 * Default TTL values (in seconds)
 */
export const CACHE_TTL = {
  SESSION: 60 * 60 * 24, // 24 hours
  USER: 60 * 60, // 1 hour
  PRODUCT: 60 * 5, // 5 minutes
  CATEGORY: 60 * 30, // 30 minutes
  CART: 60 * 60 * 24 * 7, // 7 days
  RATE_LIMIT: 60, // 1 minute
  ANALYTICS: 60 * 15, // 15 minutes
  INVENTORY: 60, // 1 minute (real-time)
} as const;

/**
 * Set a cached value with optional TTL
 */
export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds?: number
): Promise<void> {
  const client = getRedisClient();
  const serialized = JSON.stringify(value);

  if (ttlSeconds) {
    await client.setex(key, ttlSeconds, serialized);
  } else {
    await client.set(key, serialized);
  }
}

/**
 * Get a cached value
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  const value = await client.get(key);

  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/**
 * Delete a cached value
 */
export async function deleteCache(key: string): Promise<void> {
  const client = getRedisClient();
  await client.del(key);
}

/**
 * Delete all keys matching a pattern
 */
export async function deleteCachePattern(pattern: string): Promise<void> {
  const client = getRedisClient();
  const keys = await client.keys(pattern);

  if (keys.length > 0) {
    await client.del(...keys);
  }
}

/**
 * Check if a key exists
 */
export async function cacheExists(key: string): Promise<boolean> {
  const client = getRedisClient();
  const exists = await client.exists(key);
  return exists === 1;
}

// ============================================================================
// RATE LIMITING
// ============================================================================

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check and increment rate limit for an identifier
 * Uses sliding window algorithm
 */
export async function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const client = getRedisClient();
  const key = `${CACHE_KEYS.RATE_LIMIT}${identifier}`;
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  // Use a pipeline for atomic operations
  const pipeline = client.pipeline();

  // Remove old entries outside the window
  pipeline.zremrangebyscore(key, 0, windowStart);

  // Count current requests in window
  pipeline.zcard(key);

  // Add current request
  pipeline.zadd(key, now, `${now}`);

  // Set expiry on the key
  pipeline.expire(key, windowSeconds);

  const results = await pipeline.exec();

  const currentCount = (results?.[1]?.[1] as number) || 0;
  const allowed = currentCount < maxRequests;
  const remaining = Math.max(0, maxRequests - currentCount - 1);
  const resetAt = now + windowSeconds * 1000;

  return { allowed, remaining, resetAt };
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Store session data
 */
export async function setSession(
  sessionId: string,
  data: Record<string, unknown>
): Promise<void> {
  const key = `${CACHE_KEYS.SESSION}${sessionId}`;
  await setCache(key, data, CACHE_TTL.SESSION);
}

/**
 * Get session data
 */
export async function getSession(
  sessionId: string
): Promise<Record<string, unknown> | null> {
  const key = `${CACHE_KEYS.SESSION}${sessionId}`;
  return getCache<Record<string, unknown>>(key);
}

/**
 * Delete session
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const key = `${CACHE_KEYS.SESSION}${sessionId}`;
  await deleteCache(key);
}

// ============================================================================
// INVENTORY CACHING (REAL-TIME)
// ============================================================================

/**
 * Cache product inventory level
 */
export async function cacheInventory(
  productId: string,
  variantId: string,
  stock: number
): Promise<void> {
  const key = `${CACHE_KEYS.INVENTORY}${productId}:${variantId}`;
  await setCache(key, { stock, updatedAt: Date.now() }, CACHE_TTL.INVENTORY);
}

/**
 * Get cached inventory level
 */
export async function getCachedInventory(
  productId: string,
  variantId: string
): Promise<{ stock: number; updatedAt: number } | null> {
  const key = `${CACHE_KEYS.INVENTORY}${productId}:${variantId}`;
  return getCache(key);
}

/**
 * Decrement inventory (for cart reservations)
 */
export async function decrementInventory(
  productId: string,
  variantId: string,
  quantity: number = 1
): Promise<number> {
  const client = getRedisClient();
  const key = `${CACHE_KEYS.INVENTORY}${productId}:${variantId}:reserved`;
  return client.incrby(key, quantity);
}

// ============================================================================
// ANALYTICS CACHING
// ============================================================================

/**
 * Increment a counter (for real-time analytics)
 */
export async function incrementCounter(
  key: string,
  ttlSeconds: number = CACHE_TTL.ANALYTICS
): Promise<number> {
  const client = getRedisClient();
  const fullKey = `${CACHE_KEYS.ANALYTICS}${key}`;

  const pipeline = client.pipeline();
  pipeline.incr(fullKey);
  pipeline.expire(fullKey, ttlSeconds);

  const results = await pipeline.exec();
  return (results?.[0]?.[1] as number) || 0;
}

/**
 * Get counter value
 */
export async function getCounter(key: string): Promise<number> {
  const client = getRedisClient();
  const fullKey = `${CACHE_KEYS.ANALYTICS}${key}`;
  const value = await client.get(fullKey);
  return parseInt(value || '0', 10);
}

// ============================================================================
// PUB/SUB FOR REAL-TIME UPDATES
// ============================================================================

/**
 * Publish a message to a channel
 */
export async function publish(
  channel: string,
  message: Record<string, unknown>
): Promise<void> {
  const client = getRedisClient();
  await client.publish(channel, JSON.stringify(message));
}

/**
 * Subscribe to a channel
 * Returns a new Redis client for subscriptions (can't use same client for pub/sub and other commands)
 */
export function createSubscriber(): Redis {
  return new Redis(REDIS_URL);
}

// ============================================================================
// CLEANUP
// ============================================================================

/**
 * Close Redis connection gracefully
 */
export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

export default redisClient;
