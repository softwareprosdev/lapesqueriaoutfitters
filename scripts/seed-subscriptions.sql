-- Seed Subscription Plans for ShennaStudio
-- This script ensures the 3 tiers exist with the requested names and pricing.

INSERT INTO "subscription_plans" (
  "id", "name", "tier", "description", "priceMonthly", "braceletsPerMonth", 
  "exclusiveDiscounts", "earlyAccess", "limitedEditions", "vipPerks", 
  "features", "badgeColor", "isActive", "createdAt", "updatedAt"
)
VALUES 
  (
    'plan_basic_001', 
    'Ocean Explorer', 
    'BASIC', 
    'Start your ocean jewelry journey with 1 beautiful bracelet delivered each month, plus subscriber-only discounts.', 
    19.99, 1, 
    true, false, false, false, 
    ARRAY['1 Handcrafted Bracelet Monthly', '10% Subscriber Discount', 'Free Shipping on Subscription', 'Ocean Conservation Impact', 'Cancel Anytime'], 
    '#06b6d4', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  ),
  (
    'plan_premium_001', 
    'Wave Guardian', 
    'PREMIUM', 
    'Elevate your collection with 2 bracelets monthly, early access to new designs, and exclusive subscriber perks.', 
    34.99, 2, 
    true, true, false, false, 
    ARRAY['2 Handcrafted Bracelets Monthly', '15% Subscriber Discount', 'Free Shipping Always', 'Early Access to New Designs', 'Ocean Conservation Impact', 'Priority Support'], 
    '#14b8a6', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  ),
  (
    'plan_collector_001', 
    'Tide Master', 
    'COLLECTOR', 
    'The ultimate ocean jewelry experience. 3 bracelets including limited editions, VIP perks, and exclusive collector benefits.', 
    54.99, 3, 
    true, true, true, true, 
    ARRAY['3 Handcrafted Bracelets Monthly', '20% Subscriber Discount', 'Free Expedited Shipping', 'Limited Edition Exclusives', 'Early Access + Sneak Peeks', 'VIP Collector Perks', 'Personal Stylist Consultation', 'Birthday Surprise Gift'], 
    '#f472b6', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  )
ON CONFLICT ("tier") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "priceMonthly" = EXCLUDED."priceMonthly",
  "braceletsPerMonth" = EXCLUDED."braceletsPerMonth",
  "exclusiveDiscounts" = EXCLUDED."exclusiveDiscounts",
  "earlyAccess" = EXCLUDED."earlyAccess",
  "limitedEditions" = EXCLUDED."limitedEditions",
  "vipPerks" = EXCLUDED."vipPerks",
  "features" = EXCLUDED."features",
  "badgeColor" = EXCLUDED."badgeColor",
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = CURRENT_TIMESTAMP;
