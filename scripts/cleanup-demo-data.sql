-- =====================================================
-- PRODUCTION CLEANUP SCRIPT
-- Remove all demo/dummy data before going live
--
-- WARNING: This script will permanently delete data.
-- Make sure to backup your database before running.
--
-- Run with: psql $DATABASE_URL -f scripts/cleanup-demo-data.sql
-- Or in Prisma: npx prisma db execute --file scripts/cleanup-demo-data.sql
-- =====================================================

BEGIN;

-- =====================================================
-- 1. DELETE DEMO REVIEWS
-- These are the 54 fake reviews seeded by seed-content.ts
-- =====================================================
DELETE FROM "Review"
WHERE "customerName" IN (
  'Maria G.', 'Carlos R.', 'Ashley M.', 'Jennifer K.', 'Brandon T.',
  'Rachel S.', 'Michael D.', 'Stephanie L.', 'David W.', 'Emily H.',
  'Jessica P.', 'Amanda C.', 'Sarah J.', 'Michelle B.', 'Laura V.',
  'Christina M.', 'Nicole F.', 'Amber R.', 'Heather W.', 'Megan S.',
  'Brittany L.', 'Danielle K.', 'Tiffany H.', 'Samantha G.', 'Courtney P.',
  'Lauren T.', 'Kayla M.', 'Hannah B.', 'Alyssa D.', 'Taylor R.',
  'Alexis W.', 'Elizabeth C.', 'Katherine J.', 'Victoria S.', 'Rebecca N.',
  'Melissa A.', 'Andrea F.', 'Kimberly L.', 'Lisa M.', 'Patricia G.',
  'Sandra H.', 'Nancy K.', 'Betty T.', 'Dorothy W.', 'Margaret S.',
  'Ruth B.', 'Sharon D.', 'Deborah R.', 'Carol M.', 'Helen P.',
  'Anna K.', 'Grace L.', 'Lily H.', 'Sofia T.'
);

-- Alternative: Delete all reviews if you want to start fresh
-- DELETE FROM "Review";

-- =====================================================
-- 2. DELETE DEMO SHIPPING LABELS
-- These are fake labels from seed-shipping-labels.ts
-- Identified by order numbers starting with SHENA-
-- =====================================================

-- First, delete shipping labels for demo orders
DELETE FROM "ShippingLabel"
WHERE "orderId" IN (
  SELECT id FROM "Order"
  WHERE "orderNumber" LIKE 'SHENA-%'
);

-- Delete the demo orders themselves
DELETE FROM "OrderItem"
WHERE "orderId" IN (
  SELECT id FROM "Order"
  WHERE "orderNumber" LIKE 'SHENA-%'
);

DELETE FROM "Order"
WHERE "orderNumber" LIKE 'SHENA-%';

-- =====================================================
-- 3. DELETE SYNTHETIC ANALYTICS DATA
-- These are fake analytics events from seed-analytics.ts
-- =====================================================
DELETE FROM "ProductAnalytics";

-- =====================================================
-- 4. DELETE DUMMY T-SHIRT PRODUCTS
-- Products explicitly created as test/dummy items
-- (NOT your real products)
-- =====================================================

-- Delete variants of dummy products first (foreign key constraint)
DELETE FROM "ProductVariant"
WHERE "productId" IN (
  SELECT id FROM "Product"
  WHERE name ILIKE '%dummy%'
     OR sku LIKE 'DUMMY-%'
);

-- Delete dummy products
DELETE FROM "Product"
WHERE name ILIKE '%dummy%'
   OR sku LIKE 'DUMMY-%';

-- Delete the dummy t-shirts category if it exists
DELETE FROM "Category"
WHERE slug = 'dummy-t-shirts';

-- =====================================================
-- 5. CLEANUP ORPHANED DATA
-- Remove any orphaned records
-- =====================================================

-- Delete orphaned order items (orders that no longer exist)
DELETE FROM "OrderItem"
WHERE "orderId" NOT IN (SELECT id FROM "Order");

-- Delete orphaned shipping labels
DELETE FROM "ShippingLabel"
WHERE "orderId" IS NOT NULL
  AND "orderId" NOT IN (SELECT id FROM "Order");

-- Delete orphaned product variants
DELETE FROM "ProductVariant"
WHERE "productId" NOT IN (SELECT id FROM "Product");

-- =====================================================
-- 6. VERIFY CLEANUP (Optional - comment out if not needed)
-- =====================================================
-- These queries show what remains after cleanup

-- SELECT 'Reviews remaining:' as info, COUNT(*) as count FROM "Review";
-- SELECT 'Orders remaining:' as info, COUNT(*) as count FROM "Order";
-- SELECT 'ShippingLabels remaining:' as info, COUNT(*) as count FROM "ShippingLabel";
-- SELECT 'Products remaining:' as info, COUNT(*) as count FROM "Product";
-- SELECT 'ProductVariants remaining:' as info, COUNT(*) as count FROM "ProductVariant";

COMMIT;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'Demo data cleanup completed successfully!' as message;
