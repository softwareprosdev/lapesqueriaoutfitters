-- Add new categories to your ShennaStudio database
-- Run this in Coolify's PostgreSQL database console

-- Insert new categories (will skip if slug already exists)
INSERT INTO categories (id, name, slug, description, image, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'Bracelets', 'bracelets', 'Handcrafted ocean-inspired bracelets for all styles', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400', NOW(), NOW()),
  (gen_random_uuid(), 'Necklaces', 'necklaces', 'Beautiful ocean-themed necklaces and pendants', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400', NOW(), NOW()),
  (gen_random_uuid(), 'T-Shirts', 't-shirts', 'Comfortable ocean-inspired apparel and tees', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', NOW(), NOW()),
  (gen_random_uuid(), 'Pets', 'pets', 'Ocean-themed accessories for your furry friends', 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400', NOW(), NOW()),
  (gen_random_uuid(), 'Holidays', 'holidays', 'Special holiday-themed ocean jewelry and gifts', 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=400', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Verify categories were added
SELECT id, name, slug, description 
FROM categories 
ORDER BY "createdAt" DESC;
