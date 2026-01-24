# Blog API Setup Guide

Step-by-step guide to set up and use the Blog Management API.

## Prerequisites

Before using the Blog API, ensure you have:

- [x] PostgreSQL database configured
- [x] Prisma schema with BlogPost model
- [x] NextAuth authentication set up
- [x] Admin user created
- [x] Environment variables configured

## Step 1: Verify Database Schema

The BlogPost model should already exist in your Prisma schema at `/prisma/schema.prisma`:

```prisma
model BlogPost {
  id             String    @id @default(cuid())
  title          String
  slug           String    @unique
  excerpt        String?   @db.Text
  content        String    @db.Text
  featuredImage  String?
  category       String?
  tags           String[]
  featured       Boolean   @default(false)
  published      Boolean   @default(false)
  publishedAt    DateTime?
  authorId       String
  author         User      @relation("BlogAuthor", fields: [authorId], references: [id], onDelete: Cascade)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@index([slug])
  @@index([category])
  @@index([published, publishedAt])
  @@index([featured, published])
  @@index([authorId])
  @@map("blog_posts")
}
```

Check the User model has the blog posts relation:

```prisma
model User {
  // ... other fields
  blogPosts       BlogPost[] @relation("BlogAuthor")
}
```

## Step 2: Run Database Migration

If the BlogPost model was just added, create and run the migration:

```bash
# Generate migration
npx prisma migrate dev --name add_blog_posts

# Or if in production
npx prisma migrate deploy
```

Verify the migration:

```bash
# Check database
npx prisma studio

# Look for 'blog_posts' table
```

## Step 3: Verify Prisma Client

Regenerate Prisma Client to include BlogPost types:

```bash
npx prisma generate
```

This updates the Prisma Client with BlogPost model types.

## Step 4: Test Authentication

Ensure you have an admin user and can authenticate:

```bash
# Start dev server
npm run dev

# Navigate to admin login
# http://localhost:3000/admin/login

# Log in with admin credentials
```

Verify your session has admin role:

```typescript
// In any API route or page
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const session = await getServerSession(authOptions);
console.log('User role:', session?.user?.role); // Should be 'ADMIN'
```

## Step 5: Test API Endpoints

### Option A: Using Browser/Curl

```bash
# List posts (should return empty array initially)
curl http://localhost:3000/api/admin/blog \
  -H "Cookie: your-session-cookie"

# Create a test post
curl -X POST http://localhost:3000/api/admin/blog \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "title": "Test Post",
    "slug": "test-post",
    "content": "This is a test post",
    "published": false
  }'
```

### Option B: Using the TypeScript Client

Create a test file `/src/scripts/test-blog-api.ts`:

```typescript
import { createBlogPost, listBlogPosts } from '@/lib/api/blog';

async function testBlogAPI() {
  try {
    // Create a test post
    console.log('Creating test post...');
    const post = await createBlogPost({
      title: 'My First Blog Post',
      slug: 'my-first-blog-post',
      content: `
# Welcome to the Blog

This is my first blog post about ocean conservation.

## Topics Covered

- Marine life protection
- Beach cleanup initiatives
- Supporting local conservation
      `,
      excerpt: 'An introduction to our conservation efforts',
      category: 'Conservation',
      tags: ['ocean', 'conservation', 'introduction'],
      featured: false,
      published: false,
    });

    console.log('✓ Post created:', post.id);

    // List posts
    console.log('\nListing all posts...');
    const { posts, pagination } = await listBlogPosts({ page: 1, limit: 10 });
    console.log(`✓ Found ${pagination.total} posts`);

    posts.forEach(p => {
      console.log(`  - ${p.title} (${p.published ? 'Published' : 'Draft'})`);
    });

  } catch (error) {
    console.error('✗ Test failed:', error);
  }
}

testBlogAPI();
```

Run it:

```bash
npx tsx src/scripts/test-blog-api.ts
```

### Option C: Using Postman/Insomnia

Import this collection:

```json
{
  "name": "Blog API",
  "requests": [
    {
      "name": "List Posts",
      "method": "GET",
      "url": "http://localhost:3000/api/admin/blog"
    },
    {
      "name": "Create Post",
      "method": "POST",
      "url": "http://localhost:3000/api/admin/blog",
      "body": {
        "title": "Test Post",
        "slug": "test-post",
        "content": "Content here"
      }
    }
  ]
}
```

## Step 6: Verify Frontend Integration

Create a simple admin page to test the API:

`/src/app/admin/blog-test/page.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { listBlogPosts } from '@/lib/api/blog';
import type { BlogPost } from '@/types/blog';

export default function BlogTestPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPosts() {
      try {
        const { posts } = await listBlogPosts({ page: 1, limit: 10 });
        setPosts(posts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Blog Posts ({posts.length})</h1>
      {posts.length === 0 ? (
        <p>No posts yet. Create one using the API!</p>
      ) : (
        <ul className="space-y-2">
          {posts.map(post => (
            <li key={post.id} className="border p-4 rounded">
              <h2 className="font-semibold">{post.title}</h2>
              <p className="text-sm text-gray-600">
                {post.published ? 'Published' : 'Draft'} |
                By {post.author.name || post.author.email}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

Visit: `http://localhost:3000/admin/blog-test`

## Step 7: Create Your First Blog Post

### Using the API Directly

```typescript
import { createBlogPost, togglePublishStatus } from '@/lib/api/blog';

// 1. Create draft
const draft = await createBlogPost({
  title: 'Protecting Sea Turtles in South Padre Island',
  slug: 'protecting-sea-turtles-spi',
  excerpt: 'Learn about our local sea turtle conservation efforts',
  content: `
# Protecting Sea Turtles in South Padre Island

South Padre Island is a critical nesting ground for several species of sea turtles.

## Why It Matters

Sea turtles face numerous threats including...

## How You Can Help

1. Reduce plastic usage
2. Keep beaches clean
3. Report turtle sightings to local authorities
  `,
  category: 'Conservation',
  tags: ['sea-turtles', 'conservation', 'south-padre-island'],
  featuredImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19',
  featured: true,
  published: false,
});

console.log('Draft created:', draft.id);

// 2. Publish when ready
await togglePublishStatus(draft.id);
console.log('Published!');
```

## Step 8: Set Up Your Blog Display Pages

The API is ready, but you need frontend pages to display the blog:

1. **Blog List Page** - `/src/app/blog/page.tsx`
2. **Blog Post Page** - `/src/app/blog/[slug]/page.tsx`
3. **Admin Blog Manager** - `/src/app/admin/blog/page.tsx`

See the existing blog pages at `/src/app/blog/` for examples.

## Troubleshooting

### Error: "Unauthorized"

**Problem:** API returns 401 Unauthorized

**Solutions:**
1. Ensure you're logged in as an admin user
2. Check session cookie is being sent
3. Verify user role is 'ADMIN' in database
4. Check NextAuth configuration

```sql
-- Verify user role in database
SELECT email, role FROM users WHERE email = 'your@email.com';

-- Update role if needed
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

### Error: "slug already exists"

**Problem:** API returns 409 Conflict

**Solution:** Choose a different slug or update the existing post instead

### Error: "Missing required fields"

**Problem:** API returns 400 Bad Request

**Solution:** Ensure you provide `title`, `slug`, and `content` when creating

### Error: "Blog post not found"

**Problem:** API returns 404 Not Found

**Solutions:**
1. Verify the post ID is correct
2. Check the post wasn't deleted
3. Use `listBlogPosts()` to see available posts

### Database Connection Issues

**Problem:** 500 errors or database timeouts

**Solutions:**
1. Check DATABASE_URL in .env
2. Verify PostgreSQL is running
3. Test connection: `npx prisma db pull`
4. Check Prisma logs

### Type Errors

**Problem:** TypeScript errors with blog types

**Solutions:**
1. Regenerate Prisma types: `npx prisma generate`
2. Restart TypeScript server in VSCode
3. Check imports from '@/types/blog'

## Environment Variables

Ensure these are set in `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Optional: For image uploads
BLOB_READ_WRITE_TOKEN="vercel-blob-token"
```

## Verify Setup Checklist

- [ ] Database migration completed
- [ ] Prisma Client generated
- [ ] Admin user exists and can log in
- [ ] Can access `/api/admin/blog` without 401 error
- [ ] Can create a test blog post
- [ ] Can list blog posts
- [ ] Can update a blog post
- [ ] Can toggle publish status
- [ ] Can delete a blog post
- [ ] TypeScript types work correctly
- [ ] No console errors in browser/server

## Next Steps

After setup is complete:

1. **Build Admin UI** - Create a full blog management interface
2. **Add Rich Editor** - Integrate markdown or WYSIWYG editor
3. **Image Upload** - Add featured image upload functionality
4. **Categories** - Create category management
5. **SEO** - Add meta tags and OpenGraph support
6. **Comments** - Implement comment system
7. **Analytics** - Track post views and engagement

## Additional Resources

- **API Documentation:** `README.md`
- **Usage Examples:** `EXAMPLES.md`
- **Quick Reference:** `QUICK_REFERENCE.md`
- **Implementation Details:** `IMPLEMENTATION_SUMMARY.md`

## Support

If you encounter issues:

1. Check error messages in console
2. Review API documentation
3. Test with curl/Postman first
4. Verify database schema matches
5. Check authentication works

## Production Deployment

Before deploying:

1. Run migrations: `npx prisma migrate deploy`
2. Set production environment variables
3. Test all endpoints in staging
4. Enable rate limiting
5. Set up monitoring/logging
6. Configure CDN for images
7. Enable HTTPS
8. Test with production data

---

Setup complete! You're ready to start managing blog posts.
