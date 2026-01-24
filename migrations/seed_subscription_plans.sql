-- ============================================================================
-- ShennaStudio Database Seed Script
-- Run this directly on Coolify PostgreSQL 17
-- Includes: SocialMediaPost table + Subscription Plans
-- ============================================================================

-- ============================================================================
-- 1. CREATE SOCIAL MEDIA POST TABLE (for AI Marketing Automation)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "SocialMediaPost" (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  platform      TEXT NOT NULL,
  content       TEXT NOT NULL,
  hashtags      TEXT[] DEFAULT '{}',
  "imageUrl"    TEXT,
  "scheduledAt" TIMESTAMP(3) NOT NULL,
  "postedAt"    TIMESTAMP(3),
  status        TEXT DEFAULT 'scheduled',
  "errorMessage" TEXT,
  "createdById" TEXT NOT NULL,
  "postUrl"     TEXT,
  engagement    JSONB,
  "createdAt"   TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "SocialMediaPost_scheduledAt_idx" ON "SocialMediaPost"("scheduledAt");
CREATE INDEX IF NOT EXISTS "SocialMediaPost_status_idx" ON "SocialMediaPost"(status);
CREATE INDEX IF NOT EXISTS "SocialMediaPost_createdById_idx" ON "SocialMediaPost"("createdById");
CREATE INDEX IF NOT EXISTS "SocialMediaPost_platform_idx" ON "SocialMediaPost"(platform);

-- Add foreign key constraint (if users table exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'SocialMediaPost_createdById_fkey'
  ) THEN
    ALTER TABLE "SocialMediaPost" 
    ADD CONSTRAINT "SocialMediaPost_createdById_fkey" 
    FOREIGN KEY ("createdById") REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- 2. SEED SUBSCRIPTION PLANS
-- ============================================================================

-- Insert Ocean Lover Plan (Basic)
INSERT INTO subscription_plans (
  id, name, tier, description, "priceMonthly", "stripePriceId",
  "braceletsPerMonth", "exclusiveDiscounts", "earlyAccess", "limitedEditions", "vipPerks",
  features, "badgeColor", "isActive", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid()::text,
  'Ocean Lover',
  'OCEAN_LOVER',
  'Start your ocean jewelry journey with 1 beautiful bracelet delivered each month, plus subscriber-only discounts.',
  19.99,
  NULL,
  1,
  true,
  false,
  false,
  false,
  ARRAY['1 Handcrafted Bracelet Monthly', '10% Subscriber Discount', 'Free Shipping on Subscription', 'Ocean Conservation Impact', 'Cancel Anytime'],
  '#06b6d4',
  true,
  NOW(),
  NOW()
) ON CONFLICT (tier) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  "priceMonthly" = EXCLUDED."priceMonthly",
  features = EXCLUDED.features,
  "updatedAt" = NOW();

-- Insert Wave Rider Plan (Popular)
INSERT INTO subscription_plans (
  id, name, tier, description, "priceMonthly", "stripePriceId",
  "braceletsPerMonth", "exclusiveDiscounts", "earlyAccess", "limitedEditions", "vipPerks",
  features, "badgeColor", "isActive", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid()::text,
  'Wave Rider',
  'WAVE_RIDER',
  'Elevate your collection with 2 bracelets monthly, early access to new designs, and exclusive subscriber perks.',
  34.99,
  NULL,
  2,
  true,
  true,
  false,
  false,
  ARRAY['2 Handcrafted Bracelets Monthly', '15% Subscriber Discount', 'Free Shipping Always', 'Early Access to New Designs', 'Ocean Conservation Impact', 'Priority Support'],
  '#14b8a6',
  true,
  NOW(),
  NOW()
) ON CONFLICT (tier) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  "priceMonthly" = EXCLUDED."priceMonthly",
  features = EXCLUDED.features,
  "updatedAt" = NOW();

-- Insert Collector Plan (Premium/VIP)
INSERT INTO subscription_plans (
  id, name, tier, description, "priceMonthly", "stripePriceId",
  "braceletsPerMonth", "exclusiveDiscounts", "earlyAccess", "limitedEditions", "vipPerks",
  features, "badgeColor", "isActive", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid()::text,
  'Collector',
  'COLLECTOR',
  'The ultimate ocean jewelry experience. 3 bracelets including limited editions, VIP perks, and exclusive collector benefits.',
  54.99,
  NULL,
  3,
  true,
  true,
  true,
  true,
  ARRAY['3 Handcrafted Bracelets Monthly', '20% Subscriber Discount', 'Free Expedited Shipping', 'Limited Edition Exclusives', 'Early Access + Sneak Peeks', 'VIP Collector Perks', 'Personal Stylist Consultation', 'Birthday Surprise Gift'],
  '#f472b6',
  true,
  NOW(),
  NOW()
) ON CONFLICT (tier) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  "priceMonthly" = EXCLUDED."priceMonthly",
  features = EXCLUDED.features,
  "updatedAt" = NOW();

-- ============================================================================
-- 3. VERIFY EVERYTHING
-- ============================================================================

-- Check SocialMediaPost table exists
SELECT 'SocialMediaPost table created' AS status 
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'SocialMediaPost');

-- Check subscription plans
SELECT name, tier, "priceMonthly", "braceletsPerMonth" FROM subscription_plans ORDER BY "priceMonthly";

-- Done!
SELECT '✅ All migrations complete!' AS message;
