# Adding New Categories to Coolify Database

## Quick Method: Run SQL Directly

Since the seed script doesn't work in the production container, use this SQL instead:

### In Coolify Container Console:

```bash
# Connect to PostgreSQL
psql $DATABASE_URL

# Or if that doesn't work, try:
psql -h localhost -U postgres -d your_database_name
```

### Then run this SQL:

```sql
INSERT INTO categories (id, name, slug, description, image, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'Bracelets', 'bracelets', 'Handcrafted ocean-inspired bracelets for all styles', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400', NOW(), NOW()),
  (gen_random_uuid(), 'Necklaces', 'necklaces', 'Beautiful ocean-themed necklaces and pendants', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400', NOW(), NOW()),
  (gen_random_uuid(), 'T-Shirts', 't-shirts', 'Comfortable ocean-inspired apparel and tees', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', NOW(), NOW()),
  (gen_random_uuid(), 'Pets', 'pets', 'Ocean-themed accessories for your furry friends', 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400', NOW(), NOW()),
  (gen_random_uuid(), 'Holidays', 'holidays', 'Special holiday-themed ocean jewelry and gifts', 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=400', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
```

### Verify it worked:

```sql
SELECT id, name, slug FROM categories ORDER BY "createdAt" DESC;
```

## Alternative: Via Coolify Database UI

Some Coolify setups have a database management UI:

1. Go to your database in Coolify
2. Click "Database UI" or similar
3. Go to the `categories` table
4. Manually insert the new rows with the data above

## Verify in Admin Panel

After adding categories:
1. Go to `/admin/categories`
2. You should see all 11 categories including the new ones
3. You can now assign products to these categories

## New Categories Added:

- **Bracelets** - Main bracelet category
- **Necklaces** - Ocean-themed necklaces  
- **T-Shirts** - Apparel line
- **Pets** - Pet accessories
- **Holidays** - Holiday/seasonal items
