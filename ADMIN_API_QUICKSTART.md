# Admin API Quick Start Guide

Fast reference for using the ShennaStudio Admin API.

## Quick Test

```bash
# Start the dev server
npm run dev

# Test the API (in another terminal)
curl http://localhost:3000/api/admin/stats
```

## Common Operations

### List Products
```bash
curl "http://localhost:3000/api/admin/products?limit=10"
```

### Create Product
```bash
curl -X POST http://localhost:3000/api/admin/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ocean Bracelet",
    "slug": "ocean-bracelet",
    "sku": "OB-001",
    "basePrice": 29.99,
    "variants": [{
      "name": "Small - Blue",
      "sku": "OB-001-SM-BL",
      "price": 29.99,
      "stock": 10
    }]
  }'
```

### Update Order Status
```bash
curl -X PUT http://localhost:3000/api/admin/orders/[id] \
  -H "Content-Type: application/json" \
  -d '{"status": "SHIPPED"}'
```

### Add Inventory
```bash
curl -X POST http://localhost:3000/api/admin/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "variantId": "[variant-id]",
    "type": "RESTOCK",
    "quantity": 50
  }'
```

## API Endpoints Summary

| Resource   | List                    | Create                  | Read                      | Update                    | Delete                    |
|------------|-------------------------|-------------------------|---------------------------|---------------------------|---------------------------|
| Products   | GET /products           | POST /products          | GET /products/[id]        | PUT /products/[id]        | DELETE /products/[id]     |
| Categories | GET /categories         | POST /categories        | GET /categories/[id]      | PUT /categories/[id]      | DELETE /categories/[id]   |
| Orders     | GET /orders             | -                       | GET /orders/[id]          | PUT /orders/[id]          | -                         |
| Users      | GET /users              | -                       | GET /users/[id]           | -                         | -                         |
| Inventory  | GET /inventory          | POST /inventory         | -                         | -                         | -                         |
| Stats      | GET /stats              | -                       | -                         | -                         | -                         |

## Common Query Parameters

```bash
# Pagination
?limit=20&offset=0
?limit=10&page=2

# Search
?search=ocean

# Sorting
?sort=createdAt&order=desc

# Filtering
?status=PENDING
?featured=true
?categoryId=xyz
```

## Response Formats

### Success
```json
{
  "success": true,
  "data": { /* resource */ }
}
```

### List (Paginated)
```json
{
  "success": true,
  "data": [ /* resources */ ],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0,
    "page": 1,
    "totalPages": 5
  }
}
```

### Error
```json
{
  "success": false,
  "error": "Product not found"
}
```

## TypeScript Usage

```typescript
import type { CreateProductInput } from '@/lib/api/validations'
import type { ApiSuccessResponse } from '@/lib/api/responses'

// Type-safe request
const product: CreateProductInput = {
  name: "Ocean Bracelet",
  slug: "ocean-bracelet",
  sku: "OB-001",
  basePrice: 29.99,
  variants: [/* ... */]
}

// Type-safe response
const response = await fetch('/api/admin/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(product)
})

const result: ApiSuccessResponse = await response.json()
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `409` - Conflict (duplicate)
- `500` - Server Error

## Files to Reference

1. **Full Documentation**: `/src/app/api/admin/README.md`
2. **API Structure**: `/src/app/api/admin/API_STRUCTURE.md`
3. **Test Examples**: `/src/app/api/admin/test-examples.http`
4. **Validation Schemas**: `/src/lib/api/validations.ts`
5. **Response Types**: `/src/lib/api/responses.ts`

## Testing with REST Client

Install the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) VS Code extension, then open:

```
/src/app/api/admin/test-examples.http
```

Click "Send Request" above any HTTP request to test.

## Common Validation Patterns

### Product Slug
```typescript
slug: "lowercase-with-hyphens-only"
// Valid: "ocean-bracelet"
// Invalid: "Ocean Bracelet", "ocean_bracelet"
```

### Price
```typescript
basePrice: number // Must be positive
// Valid: 29.99
// Invalid: -10, 0
```

### Stock
```typescript
stock: number // Must be >= 0
// Valid: 10, 0
// Invalid: -5
```

### Required Fields (Product)
```typescript
{
  name: string,      // Required
  slug: string,      // Required
  sku: string,       // Required, unique
  basePrice: number, // Required
  variants: []       // Required, min 1
}
```

## Environment Setup

```bash
# Required environment variables
DATABASE_URL="postgresql://..."

# Optional (for production)
NODE_ENV=production
```

## Quick Troubleshooting

### "Cannot find module '@/lib/prisma'"
- Run `npm run db:generate` to generate Prisma client

### "Validation error"
- Check request body against Zod schemas in `/src/lib/api/validations.ts`
- Ensure all required fields are present

### "Database error"
- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env.local`
- Run migrations: `npm run db:push`

### "404 Not Found"
- Check endpoint URL
- Ensure resource ID is valid CUID

## Next Steps

1. Read full documentation: `/src/app/api/admin/README.md`
2. Test with provided examples: `/src/app/api/admin/test-examples.http`
3. Implement authentication (next agent task)
4. Build admin UI frontend

---

**Need Help?** Check the complete documentation in the files listed above.
