# Blog Management API Documentation

Comprehensive API routes for managing blog posts in the ShennaStudio e-commerce platform.

## Base URL

All endpoints are prefixed with `/api/admin/blog`

## Authentication

All endpoints require:
- Valid NextAuth session
- User role: `ADMIN`

Unauthorized requests will receive a `401 Unauthorized` response.

---

## Endpoints

### 1. List All Blog Posts

**GET** `/api/admin/blog`

Retrieve a paginated list of blog posts with optional filtering and sorting.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | `1` | Page number for pagination |
| `limit` | number | `10` | Number of posts per page |
| `published` | boolean | - | Filter by published status (`true` or `false`) |
| `category` | string | - | Filter by category |
| `featured` | boolean | - | Filter by featured status (`true` or `false`) |
| `search` | string | - | Search in title, excerpt, content, and tags |
| `sortBy` | string | `createdAt` | Field to sort by (e.g., `createdAt`, `title`, `publishedAt`) |
| `sortOrder` | string | `desc` | Sort order (`asc` or `desc`) |

#### Response

```json
{
  "posts": [
    {
      "id": "clx...",
      "title": "Ocean Conservation Tips",
      "slug": "ocean-conservation-tips",
      "excerpt": "Learn how to protect our oceans...",
      "content": "Full content here...",
      "featuredImage": "https://...",
      "category": "Conservation",
      "tags": ["ocean", "conservation", "tips"],
      "featured": true,
      "published": true,
      "publishedAt": "2024-01-15T10:00:00Z",
      "authorId": "clx...",
      "author": {
        "id": "clx...",
        "name": "John Doe",
        "email": "admin@shennastudio.com",
        "image": "https://..."
      },
      "createdAt": "2024-01-10T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasMore": true
  }
}
```

#### Status Codes

- `200 OK` - Success
- `401 Unauthorized` - Not authenticated or not admin
- `500 Internal Server Error` - Server error

---

### 2. Get Single Blog Post

**GET** `/api/admin/blog/[id]`

Retrieve a single blog post by its ID.

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Blog post ID (cuid) |

#### Response

```json
{
  "id": "clx...",
  "title": "Ocean Conservation Tips",
  "slug": "ocean-conservation-tips",
  "excerpt": "Learn how to protect our oceans...",
  "content": "Full content here...",
  "featuredImage": "https://...",
  "category": "Conservation",
  "tags": ["ocean", "conservation", "tips"],
  "featured": true,
  "published": true,
  "publishedAt": "2024-01-15T10:00:00Z",
  "authorId": "clx...",
  "author": {
    "id": "clx...",
    "name": "John Doe",
    "email": "admin@shennastudio.com",
    "image": "https://..."
  },
  "createdAt": "2024-01-10T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

#### Status Codes

- `200 OK` - Success
- `401 Unauthorized` - Not authenticated or not admin
- `404 Not Found` - Blog post not found
- `500 Internal Server Error` - Server error

---

### 3. Create New Blog Post

**POST** `/api/admin/blog`

Create a new blog post.

#### Request Body

```json
{
  "title": "Ocean Conservation Tips",
  "slug": "ocean-conservation-tips",
  "excerpt": "Learn how to protect our oceans...",
  "content": "Full content here...",
  "featuredImage": "https://...",
  "category": "Conservation",
  "tags": ["ocean", "conservation", "tips"],
  "featured": true,
  "published": false
}
```

#### Required Fields

- `title` (string)
- `slug` (string, must be unique)
- `content` (string)

#### Optional Fields

- `excerpt` (string)
- `featuredImage` (string)
- `category` (string)
- `tags` (string[])
- `featured` (boolean, default: `false`)
- `published` (boolean, default: `false`)

#### Response

Returns the created blog post with author information (same structure as GET single post).

#### Status Codes

- `201 Created` - Success
- `400 Bad Request` - Missing required fields
- `401 Unauthorized` - Not authenticated or not admin
- `409 Conflict` - Slug already exists
- `500 Internal Server Error` - Server error

#### Notes

- `authorId` is automatically set to the authenticated user's ID
- `publishedAt` is automatically set to current date/time if `published` is `true`
- Blog pages are automatically revalidated after creation

---

### 4. Update Blog Post

**PUT** `/api/admin/blog/[id]`

Update an existing blog post.

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Blog post ID (cuid) |

#### Request Body

All fields are optional. Only provided fields will be updated:

```json
{
  "title": "Updated Title",
  "slug": "updated-slug",
  "excerpt": "Updated excerpt...",
  "content": "Updated content...",
  "featuredImage": "https://...",
  "category": "Updated Category",
  "tags": ["updated", "tags"],
  "featured": false,
  "published": true
}
```

#### Response

Returns the updated blog post with author information.

#### Status Codes

- `200 OK` - Success
- `401 Unauthorized` - Not authenticated or not admin
- `404 Not Found` - Blog post not found
- `409 Conflict` - New slug already exists
- `500 Internal Server Error` - Server error

#### Notes

- If `published` is set to `true` and post wasn't published before, `publishedAt` is set to current date/time
- If `published` is set to `false`, `publishedAt` is cleared
- Old and new blog page URLs are revalidated if slug changes

---

### 5. Delete Blog Post

**DELETE** `/api/admin/blog/[id]`

Delete a blog post permanently.

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Blog post ID (cuid) |

#### Response

```json
{
  "success": true
}
```

#### Status Codes

- `200 OK` - Success
- `401 Unauthorized` - Not authenticated or not admin
- `404 Not Found` - Blog post not found
- `500 Internal Server Error` - Server error

#### Notes

- This action is permanent and cannot be undone
- Blog pages are automatically revalidated after deletion

---

### 6. Toggle Publish Status

**POST** `/api/admin/blog/[id]/publish`

Toggle the published status of a blog post (publish if unpublished, unpublish if published).

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Blog post ID (cuid) |

#### Response

```json
{
  "success": true,
  "published": true,
  "publishedAt": "2024-01-15T10:00:00Z",
  "message": "Blog post published successfully",
  "post": {
    // Full post object with author
  }
}
```

#### Status Codes

- `200 OK` - Success
- `401 Unauthorized` - Not authenticated or not admin
- `404 Not Found` - Blog post not found
- `500 Internal Server Error` - Server error

#### Notes

- When publishing, preserves existing `publishedAt` if available, otherwise sets to current date/time
- When unpublishing, clears `publishedAt`
- Blog pages are automatically revalidated

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

## Database Schema

Blog posts are stored in the `blog_posts` table with the following structure:

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
}
```

## Cache Revalidation

All mutating operations (POST, PUT, DELETE) automatically revalidate the following paths:
- `/blog` - Main blog listing page
- `/blog/[slug]` - Individual blog post page(s)

This ensures the frontend always displays the latest content without manual cache clearing.

## Usage Examples

### JavaScript/TypeScript Fetch Examples

#### List all published posts

```typescript
const response = await fetch('/api/admin/blog?published=true&page=1&limit=10');
const data = await response.json();
```

#### Get a specific post

```typescript
const response = await fetch('/api/admin/blog/clx...');
const post = await response.json();
```

#### Create a new post

```typescript
const response = await fetch('/api/admin/blog', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'My New Post',
    slug: 'my-new-post',
    content: 'Post content here...',
    published: false,
  }),
});
const newPost = await response.json();
```

#### Update a post

```typescript
const response = await fetch('/api/admin/blog/clx...', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Updated Title',
    published: true,
  }),
});
const updatedPost = await response.json();
```

#### Delete a post

```typescript
const response = await fetch('/api/admin/blog/clx...', {
  method: 'DELETE',
});
const result = await response.json();
```

#### Toggle publish status

```typescript
const response = await fetch('/api/admin/blog/clx.../publish', {
  method: 'POST',
});
const result = await response.json();
```

## TypeScript Types

See `/src/types/blog.ts` for TypeScript type definitions for all request/response payloads.
