# Storing Images in Postgres (Neon) Guide

This guide explains how to transition from Vercel Blob storage to storing images directly in your Neon (PostgreSQL) database.

> **⚠️ Performance Warning:** Storing images directly in a relational database (as `bytea` or Base64 strings) is generally **not recommended** for production web applications. It increases database size, slows down backups/restores, increases RAM usage, and can negatively impact query performance. Using a dedicated object store (like Vercel Blob, AWS S3, or Cloudflare R2) is the standard best practice.

However, if you prefer a single-provider solution, follow these steps.

## 1. Schema Update (`prisma/schema.prisma`)

You need to modify your schema to store the image data. Since you likely want to store the binary data or a base64 string, you can use the `Bytes` type (for binary) or `String` (for Base64).

**Option A: Base64 String (Simpler to handle in frontend)**
```prisma
model ProductImage {
  id        String   @id @default(cuid())
  // Remove 'url' if you only want DB storage, or keep it for backward compatibility
  // url    String? 
  data      String   @db.Text // Store Base64 string here
  alt       String?
  // ... other fields
}

// Do this for other models with images (User, Category, etc.)
```

**Option B: Binary Data (More efficient storage)**
```prisma
model ProductImage {
  id        String   @id @default(cuid())
  data      Bytes    // Store raw binary buffer
  mimeType  String   // e.g., "image/jpeg"
  // ... other fields
}
```

## 2. Migration

After updating the schema:
```bash
npx prisma migrate dev --name add_image_data_columns
```

## 3. Implementation Changes

### A. Uploading (Server Action or API Route)

Instead of sending the file to Vercel Blob, you will convert it to a format suitable for the DB.

**Example (Server Action):**

```typescript
// src/app/actions/upload-image.ts
'use server'

import { prisma } from '@/lib/db'

export async function uploadImageToDB(formData: FormData) {
  const file = formData.get('file') as File
  if (!file) throw new Error('No file uploaded')

  // Convert to Buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  
  // Option A: Base64
  const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`

  await prisma.productImage.create({
    data: {
      // ... other fields
      data: base64Data 
    }
  })
}
```

### B. Displaying Images

**If using Base64 (Option A):**
You can use the stored string directly in the `src` attribute.

```tsx
<Image 
  src={productImage.data} 
  alt={productImage.alt} 
  width={400} 
  height={400} 
/>
```
*Note: Next.js `Image` component optimization might not work as efficiently with Data URLs.*

**If using Binary (Option B):**
You need an API route to serve the image.

```typescript
// src/app/api/images/[id]/route.ts
import { prisma } from '@/lib/db'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const image = await prisma.productImage.findUnique({ where: { id: params.id } })
  
  if (!image) return new Response('Not Found', { status: 404 })

  return new Response(image.data, {
    headers: {
      'Content-Type': image.mimeType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
```
Then use `<Image src={`/api/images/${id}`} ... />`.

## 4. Migrating Existing Images

You would need to write a script that:
1. Fetches the current `url` from the database.
2. Downloads the image data from Vercel Blob.
3. Updates the database record with the downloaded data.

## 5. Summary of Trade-offs

| Feature | Vercel Blob (Current) | Neon DB (Proposed) |
| :--- | :--- | :--- |
| **Performance** | High (CDN, Optimization) | Low (Database load) |
| **Cost** | Separate billing (Usage based) | Increases DB storage costs |
| **Setup** | Requires API Token | Built-in |
| **Complexity** | Low | Medium (Handling binary data) |
| **Scalability** | High | Limited by DB size |

**Recommendation:** Stick with Vercel Blob unless strict single-provider constraints are mandatory.
