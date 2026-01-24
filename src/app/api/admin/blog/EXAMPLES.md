# Blog API Usage Examples

Complete examples demonstrating how to use the Blog Management API.

## Table of Contents

1. [Basic CRUD Operations](#basic-crud-operations)
2. [Filtering and Search](#filtering-and-search)
3. [Publishing Workflow](#publishing-workflow)
4. [Using the TypeScript Client](#using-the-typescript-client)
5. [Error Handling](#error-handling)
6. [React Component Examples](#react-component-examples)

---

## Basic CRUD Operations

### Create a Draft Blog Post

```typescript
// Using fetch directly
const response = await fetch('/api/admin/blog', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Protecting Sea Turtles in South Padre Island',
    slug: 'protecting-sea-turtles-spi',
    excerpt: 'Learn about our local sea turtle conservation efforts',
    content: `
      # Protecting Sea Turtles

      South Padre Island is home to several species of endangered sea turtles...

      ## How You Can Help

      1. Reduce plastic usage
      2. Support local conservation efforts
      3. Report turtle sightings
    `,
    category: 'Conservation',
    tags: ['sea-turtles', 'conservation', 'south-padre-island'],
    featuredImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19',
    featured: false,
    published: false,
  }),
});

const newPost = await response.json();
console.log('Created draft post:', newPost.id);
```

### Read a Blog Post

```typescript
const postId = 'clx...';

const response = await fetch(`/api/admin/blog/${postId}`);
const post = await response.json();

console.log('Post title:', post.title);
console.log('Published:', post.published);
console.log('Author:', post.author.name);
```

### Update a Blog Post

```typescript
const postId = 'clx...';

const response = await fetch(`/api/admin/blog/${postId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Updated Title: Protecting Sea Turtles',
    featured: true,
    tags: ['sea-turtles', 'conservation', 'south-padre-island', 'marine-life'],
  }),
});

const updatedPost = await response.json();
console.log('Updated post:', updatedPost.title);
```

### Delete a Blog Post

```typescript
const postId = 'clx...';

const response = await fetch(`/api/admin/blog/${postId}`, {
  method: 'DELETE',
});

const result = await response.json();
console.log('Deleted:', result.success);
```

---

## Filtering and Search

### Get All Published Posts

```typescript
const response = await fetch('/api/admin/blog?published=true&sortBy=publishedAt&sortOrder=desc');
const { posts, pagination } = await response.json();

console.log(`Found ${pagination.total} published posts`);
posts.forEach(post => {
  console.log(`- ${post.title} (${post.publishedAt})`);
});
```

### Get Posts by Category

```typescript
const response = await fetch('/api/admin/blog?category=Conservation&published=true');
const { posts } = await response.json();

console.log('Conservation posts:', posts.length);
```

### Search Posts

```typescript
const searchQuery = 'sea turtle';
const response = await fetch(`/api/admin/blog?search=${encodeURIComponent(searchQuery)}`);
const { posts } = await response.json();

console.log(`Found ${posts.length} posts matching "${searchQuery}"`);
```

### Get Featured Posts

```typescript
const response = await fetch('/api/admin/blog?featured=true&published=true&limit=5');
const { posts } = await response.json();

console.log('Featured posts for homepage:', posts);
```

### Paginated List with Sorting

```typescript
const page = 2;
const limit = 15;

const response = await fetch(
  `/api/admin/blog?page=${page}&limit=${limit}&sortBy=title&sortOrder=asc`
);
const { posts, pagination } = await response.json();

console.log(`Page ${pagination.page} of ${pagination.totalPages}`);
console.log(`Showing posts ${(page - 1) * limit + 1}-${(page - 1) * limit + posts.length}`);
```

---

## Publishing Workflow

### Create, Edit, and Publish a Post

```typescript
// Step 1: Create draft
const createResponse = await fetch('/api/admin/blog', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Ocean Cleanup Initiative',
    slug: 'ocean-cleanup-initiative',
    content: 'Draft content...',
    published: false,
  }),
});

const draft = await createResponse.json();
console.log('Draft created:', draft.id);

// Step 2: Update content
const updateResponse = await fetch(`/api/admin/blog/${draft.id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: 'Final polished content...',
    excerpt: 'Join our ocean cleanup initiative',
    featuredImage: 'https://...',
  }),
});

const updated = await updateResponse.json();
console.log('Draft updated');

// Step 3: Publish
const publishResponse = await fetch(`/api/admin/blog/${draft.id}/publish`, {
  method: 'POST',
});

const publishResult = await publishResponse.json();
console.log('Published:', publishResult.message);
console.log('Published at:', publishResult.publishedAt);
```

### Unpublish a Post

```typescript
const postId = 'clx...';

const response = await fetch(`/api/admin/blog/${postId}/publish`, {
  method: 'POST',
});

const result = await response.json();

if (!result.published) {
  console.log('Post unpublished successfully');
}
```

### Schedule Publishing (Manual Implementation)

```typescript
// Create as draft, then publish later
const response = await fetch('/api/admin/blog', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Scheduled Post',
    slug: 'scheduled-post',
    content: 'Content to publish later',
    published: false, // Keep as draft
  }),
});

const draft = await response.json();

// Later (e.g., via cron job or manual trigger):
const publishResponse = await fetch(`/api/admin/blog/${draft.id}/publish`, {
  method: 'POST',
});
```

---

## Using the TypeScript Client

The type-safe client library provides a cleaner API:

### Import the Client

```typescript
import {
  listBlogPosts,
  getBlogPost,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  togglePublishStatus,
  getPublishedPosts,
  getDraftPosts,
  searchBlogPosts,
} from '@/lib/api/blog';
```

### Create a Post

```typescript
const newPost = await createBlogPost({
  title: 'Coral Reef Restoration',
  slug: 'coral-reef-restoration',
  content: 'Content here...',
  category: 'Conservation',
  tags: ['coral', 'reef', 'restoration'],
  published: false,
});
```

### List Published Posts

```typescript
const { posts, pagination } = await getPublishedPosts({
  page: 1,
  limit: 10,
  sortBy: 'publishedAt',
  sortOrder: 'desc',
});
```

### Search Posts

```typescript
const results = await searchBlogPosts('ocean conservation', {
  published: true,
  limit: 20,
});
```

### Update and Publish

```typescript
// Update content
const updated = await updateBlogPost(postId, {
  content: 'Updated content...',
  tags: ['updated', 'tags'],
});

// Publish
const published = await togglePublishStatus(postId);
console.log('Now published:', published.published);
```

---

## Error Handling

### Basic Error Handling

```typescript
try {
  const post = await fetch('/api/admin/blog/invalid-id').then(r => r.json());
} catch (error) {
  console.error('Failed to fetch post:', error);
}
```

### Checking Response Status

```typescript
const response = await fetch('/api/admin/blog', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Test Post',
    // Missing required 'slug' field
  }),
});

if (!response.ok) {
  const error = await response.json();

  switch (response.status) {
    case 400:
      console.error('Validation error:', error.error);
      break;
    case 401:
      console.error('Unauthorized - please log in');
      break;
    case 409:
      console.error('Conflict - slug already exists');
      break;
    default:
      console.error('Server error:', error.error);
  }
} else {
  const post = await response.json();
  console.log('Created:', post);
}
```

### Using the Type-Safe Client

```typescript
import { createBlogPost, isBlogApiError } from '@/lib/api/blog';

try {
  const post = await createBlogPost({
    title: 'New Post',
    slug: 'new-post',
    content: 'Content...',
  });

  console.log('Success:', post.id);
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);

    // Handle specific error messages
    if (error.message.includes('slug already exists')) {
      console.log('Please choose a different slug');
    }
  }
}
```

---

## React Component Examples

### Blog Post List Component

```typescript
'use client';

import { useEffect, useState } from 'react';
import { listBlogPosts } from '@/lib/api/blog';
import type { BlogPost } from '@/types/blog';

export function BlogPostList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        const { posts } = await listBlogPosts({ page, limit: 10 });
        setPosts(posts);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [page]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
          <span>{post.published ? 'Published' : 'Draft'}</span>
        </article>
      ))}
    </div>
  );
}
```

### Create Blog Post Form

```typescript
'use client';

import { useState } from 'react';
import { createBlogPost } from '@/lib/api/blog';
import type { CreateBlogPostRequest } from '@/types/blog';

export function CreateBlogPostForm() {
  const [formData, setFormData] = useState<CreateBlogPostRequest>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category: '',
    tags: [],
    published: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const post = await createBlogPost(formData);
      alert(`Post created: ${post.title}`);
      // Reset form or redirect
    } catch (error) {
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Title"
        value={formData.title}
        onChange={e => setFormData({ ...formData, title: e.target.value })}
        required
      />

      <input
        type="text"
        placeholder="Slug"
        value={formData.slug}
        onChange={e => setFormData({ ...formData, slug: e.target.value })}
        required
      />

      <textarea
        placeholder="Content"
        value={formData.content}
        onChange={e => setFormData({ ...formData, content: e.target.value })}
        required
      />

      <label>
        <input
          type="checkbox"
          checked={formData.published}
          onChange={e => setFormData({ ...formData, published: e.target.checked })}
        />
        Publish immediately
      </label>

      <button type="submit">Create Post</button>
    </form>
  );
}
```

### Toggle Publish Button

```typescript
'use client';

import { useState } from 'react';
import { togglePublishStatus } from '@/lib/api/blog';
import type { BlogPost } from '@/types/blog';

interface TogglePublishButtonProps {
  post: BlogPost;
  onUpdate: (post: BlogPost) => void;
}

export function TogglePublishButton({ post, onUpdate }: TogglePublishButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const result = await togglePublishStatus(post.id);
      onUpdate(result.post);
      alert(result.message);
    } catch (error) {
      alert('Failed to toggle publish status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleToggle} disabled={loading}>
      {loading ? 'Processing...' : post.published ? 'Unpublish' : 'Publish'}
    </button>
  );
}
```

### Search Blog Posts

```typescript
'use client';

import { useState } from 'react';
import { searchBlogPosts } from '@/lib/api/blog';
import type { BlogPost } from '@/types/blog';

export function BlogSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const { posts } = await searchBlogPosts(query);
      setResults(posts);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="search"
          placeholder="Search blog posts..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {loading && <div>Searching...</div>}

      <div>
        {results.map(post => (
          <div key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Best Practices

1. **Always validate data** before sending to the API
2. **Handle errors gracefully** and provide user feedback
3. **Use TypeScript types** for compile-time safety
4. **Implement loading states** for better UX
5. **Revalidate cache** after mutations (handled automatically by API)
6. **Use the type-safe client** instead of raw fetch when possible
7. **Check authentication** before making admin API calls
8. **Sanitize user input** especially for markdown/HTML content
9. **Use unique slugs** - check availability before creating
10. **Implement optimistic updates** for better perceived performance
