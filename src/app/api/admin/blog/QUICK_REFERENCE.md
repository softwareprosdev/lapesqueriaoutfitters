# Blog API Quick Reference

Fast reference for ShennaStudio Blog Management API.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/blog` | List all posts (paginated) |
| GET | `/api/admin/blog/[id]` | Get single post |
| POST | `/api/admin/blog` | Create new post |
| PUT | `/api/admin/blog/[id]` | Update post |
| DELETE | `/api/admin/blog/[id]` | Delete post |
| POST | `/api/admin/blog/[id]/publish` | Toggle publish status |

## Common Query Parameters

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `page` | number | `?page=2` | Page number (default: 1) |
| `limit` | number | `?limit=20` | Items per page (default: 10) |
| `published` | boolean | `?published=true` | Filter by status |
| `category` | string | `?category=Conservation` | Filter by category |
| `featured` | boolean | `?featured=true` | Filter featured posts |
| `search` | string | `?search=ocean` | Search posts |
| `sortBy` | string | `?sortBy=publishedAt` | Sort field |
| `sortOrder` | string | `?sortOrder=desc` | Sort direction |

## Quick Examples

### List Published Posts
```bash
GET /api/admin/blog?published=true&sortBy=publishedAt&sortOrder=desc
```

### Create Draft Post
```typescript
POST /api/admin/blog
{
  "title": "My Post",
  "slug": "my-post",
  "content": "Content here",
  "published": false
}
```

### Update Post
```typescript
PUT /api/admin/blog/clx123
{
  "title": "Updated Title",
  "tags": ["new", "tags"]
}
```

### Publish Post
```bash
POST /api/admin/blog/clx123/publish
```

### Search Posts
```bash
GET /api/admin/blog?search=ocean+conservation
```

## TypeScript Client

```typescript
import {
  listBlogPosts,
  getBlogPost,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  togglePublishStatus,
} from '@/lib/api/blog';

// List
const { posts, pagination } = await listBlogPosts({ page: 1 });

// Get
const post = await getBlogPost(id);

// Create
const newPost = await createBlogPost({ title, slug, content });

// Update
const updated = await updateBlogPost(id, { title: 'New Title' });

// Delete
await deleteBlogPost(id);

// Publish/Unpublish
await togglePublishStatus(id);
```

## Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not admin) |
| 404 | Not Found |
| 409 | Conflict (duplicate slug) |
| 500 | Server Error |

## Required Fields

### Create Post
- `title` (string)
- `slug` (string, unique)
- `content` (string)

### Update Post
All fields optional (partial update)

## Common Patterns

### Create → Update → Publish
```typescript
// 1. Create draft
const draft = await createBlogPost({
  title: 'Draft',
  slug: 'draft',
  content: 'Initial',
  published: false,
});

// 2. Update
await updateBlogPost(draft.id, {
  content: 'Final content',
  featuredImage: 'https://...',
});

// 3. Publish
await togglePublishStatus(draft.id);
```

### List with Filters
```typescript
const { posts } = await listBlogPosts({
  published: true,
  category: 'Conservation',
  featured: true,
  page: 1,
  limit: 5,
  sortBy: 'publishedAt',
  sortOrder: 'desc',
});
```

### Search and Display
```typescript
const results = await searchBlogPosts('sea turtle', {
  published: true,
  limit: 10,
});
```

## Error Handling

```typescript
try {
  const post = await createBlogPost(data);
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('slug already exists')) {
      // Handle duplicate slug
    } else if (error.message.includes('required')) {
      // Handle validation error
    } else {
      // Handle other errors
    }
  }
}
```

## Files Location

- API Routes: `/src/app/api/admin/blog/`
- Types: `/src/types/blog.ts`
- Client: `/src/lib/api/blog.ts`
- Tests: `/src/app/api/admin/blog/__tests__/`
- Docs: `/src/app/api/admin/blog/*.md`

## Authentication

All endpoints require:
1. Valid NextAuth session
2. User role = `ADMIN`

Add session to requests automatically via NextAuth.

## Cache Revalidation

Automatic revalidation on:
- Create: `/blog`, `/blog/[slug]`
- Update: `/blog`, old and new `/blog/[slug]`
- Delete: `/blog`, `/blog/[slug]`
- Publish: `/blog`, `/blog/[slug]`

## Common Gotchas

1. **Slug must be unique** - Check before creating/updating
2. **All updates are partial** - Only send changed fields
3. **Published posts need publishedAt** - Set automatically
4. **Search is case-insensitive** - Works across multiple fields
5. **Pagination starts at 1** - Not 0
6. **Tags are arrays** - `["tag1", "tag2"]`, not strings

## Database Schema

```typescript
interface BlogPost {
  id: string;              // Auto-generated
  title: string;           // Required
  slug: string;            // Required, unique
  excerpt?: string;        // Optional
  content: string;         // Required, can be markdown
  featuredImage?: string;  // Optional, URL
  category?: string;       // Optional
  tags: string[];          // Array, can be empty
  featured: boolean;       // Default: false
  published: boolean;      // Default: false
  publishedAt?: Date;      // Set when published
  authorId: string;        // Auto from session
  createdAt: Date;         // Auto
  updatedAt: Date;         // Auto
}
```

## Best Practices

1. Use TypeScript client instead of raw fetch
2. Always handle errors gracefully
3. Validate data before sending
4. Use unique, SEO-friendly slugs
5. Set excerpt for better previews
6. Add tags for discoverability
7. Use featured flag strategically
8. Preview before publishing
9. Keep slugs consistent (don't change often)
10. Use search instead of manual filtering

## Need More Help?

- Full API Docs: `README.md`
- Usage Examples: `EXAMPLES.md`
- Implementation Details: `IMPLEMENTATION_SUMMARY.md`
- Test Examples: `__tests__/blog-api.test.ts`
