/**
 * Blog API Integration Tests
 *
 * To run these tests:
 * 1. Ensure you have a test database set up
 * 2. Run: npm test src/app/api/admin/blog/__tests__/blog-api.test.ts
 *
 * Note: These are integration tests that require:
 * - A running database
 * - NextAuth configuration
 * - Admin user credentials
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import type {
  BlogPost,
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
  BlogPostListResponse,
} from '@/types/blog';

// Test configuration
const API_BASE = 'http://localhost:3000/api/admin/blog';
let testPostId: string;
let authCookie: string;

// Mock authentication (replace with actual auth in real tests)
beforeAll(async () => {
  // TODO: Implement actual authentication
  // This should log in as an admin user and get the session cookie
  authCookie = 'mock-auth-cookie';
});

// Cleanup after tests
afterAll(async () => {
  // TODO: Clean up test data
  if (testPostId) {
    try {
      await fetch(`${API_BASE}/${testPostId}`, {
        method: 'DELETE',
        headers: { Cookie: authCookie },
      });
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }
});

describe('Blog API - Create', () => {
  it('should create a new draft blog post', async () => {
    const newPost: CreateBlogPostRequest = {
      title: 'Test Post: Ocean Conservation',
      slug: `test-ocean-conservation-${Date.now()}`,
      content: 'This is test content about ocean conservation.',
      excerpt: 'Test excerpt',
      category: 'Conservation',
      tags: ['test', 'ocean', 'conservation'],
      published: false,
    };

    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie,
      },
      body: JSON.stringify(newPost),
    });

    expect(response.status).toBe(201);

    const post: BlogPost = await response.json();
    testPostId = post.id;

    expect(post.title).toBe(newPost.title);
    expect(post.slug).toBe(newPost.slug);
    expect(post.published).toBe(false);
    expect(post.publishedAt).toBeNull();
    expect(post.author).toBeDefined();
    expect(post.author.email).toBeDefined();
  });

  it('should reject creating post with duplicate slug', async () => {
    const duplicatePost: CreateBlogPostRequest = {
      title: 'Duplicate Test',
      slug: `test-ocean-conservation-${Date.now()}`, // Same as above
      content: 'Content',
    };

    // Create first post
    await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie,
      },
      body: JSON.stringify(duplicatePost),
    });

    // Try to create duplicate
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie,
      },
      body: JSON.stringify(duplicatePost),
    });

    expect(response.status).toBe(409);

    const error = await response.json();
    expect(error.error).toContain('slug already exists');
  });

  it('should reject creating post without required fields', async () => {
    const invalidPost = {
      title: 'Test Post',
      // Missing slug and content
    };

    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie,
      },
      body: JSON.stringify(invalidPost),
    });

    expect(response.status).toBe(400);

    const error = await response.json();
    expect(error.error).toContain('required');
  });
});

describe('Blog API - Read', () => {
  it('should list all blog posts with pagination', async () => {
    const response = await fetch(`${API_BASE}?page=1&limit=10`, {
      headers: { Cookie: authCookie },
    });

    expect(response.status).toBe(200);

    const data: BlogPostListResponse = await response.json();

    expect(data.posts).toBeDefined();
    expect(Array.isArray(data.posts)).toBe(true);
    expect(data.pagination).toBeDefined();
    expect(data.pagination.page).toBe(1);
    expect(data.pagination.limit).toBe(10);
    expect(data.pagination.total).toBeGreaterThanOrEqual(0);
  });

  it('should filter by published status', async () => {
    const response = await fetch(`${API_BASE}?published=true`, {
      headers: { Cookie: authCookie },
    });

    expect(response.status).toBe(200);

    const data: BlogPostListResponse = await response.json();

    data.posts.forEach(post => {
      expect(post.published).toBe(true);
    });
  });

  it('should search blog posts', async () => {
    const searchQuery = 'conservation';
    const response = await fetch(`${API_BASE}?search=${searchQuery}`, {
      headers: { Cookie: authCookie },
    });

    expect(response.status).toBe(200);

    const data: BlogPostListResponse = await response.json();

    data.posts.forEach(post => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery) ||
        post.content.toLowerCase().includes(searchQuery) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery));

      expect(matchesSearch).toBe(true);
    });
  });

  it('should get a single blog post by ID', async () => {
    if (!testPostId) {
      throw new Error('Test post not created');
    }

    const response = await fetch(`${API_BASE}/${testPostId}`, {
      headers: { Cookie: authCookie },
    });

    expect(response.status).toBe(200);

    const post: BlogPost = await response.json();

    expect(post.id).toBe(testPostId);
    expect(post.author).toBeDefined();
  });

  it('should return 404 for non-existent post', async () => {
    const response = await fetch(`${API_BASE}/non-existent-id`, {
      headers: { Cookie: authCookie },
    });

    expect(response.status).toBe(404);
  });
});

describe('Blog API - Update', () => {
  it('should update a blog post', async () => {
    if (!testPostId) {
      throw new Error('Test post not created');
    }

    const updates: UpdateBlogPostRequest = {
      title: 'Updated Test Post',
      featured: true,
      tags: ['updated', 'test'],
    };

    const response = await fetch(`${API_BASE}/${testPostId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie,
      },
      body: JSON.stringify(updates),
    });

    expect(response.status).toBe(200);

    const post: BlogPost = await response.json();

    expect(post.title).toBe(updates.title);
    expect(post.featured).toBe(true);
    expect(post.tags).toEqual(updates.tags);
  });

  it('should reject updating to duplicate slug', async () => {
    if (!testPostId) {
      throw new Error('Test post not created');
    }

    // Create another post
    const anotherPost = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie,
      },
      body: JSON.stringify({
        title: 'Another Post',
        slug: `another-post-${Date.now()}`,
        content: 'Content',
      }),
    }).then(r => r.json());

    // Try to update first post with second post's slug
    const response = await fetch(`${API_BASE}/${testPostId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie,
      },
      body: JSON.stringify({
        slug: anotherPost.slug,
      }),
    });

    expect(response.status).toBe(409);
  });
});

describe('Blog API - Publish', () => {
  it('should toggle publish status', async () => {
    if (!testPostId) {
      throw new Error('Test post not created');
    }

    // Get current status
    const getResponse = await fetch(`${API_BASE}/${testPostId}`, {
      headers: { Cookie: authCookie },
    });
    const beforePost: BlogPost = await getResponse.json();
    const wasPublished = beforePost.published;

    // Toggle
    const toggleResponse = await fetch(`${API_BASE}/${testPostId}/publish`, {
      method: 'POST',
      headers: { Cookie: authCookie },
    });

    expect(toggleResponse.status).toBe(200);

    const result = await toggleResponse.json();

    expect(result.success).toBe(true);
    expect(result.published).toBe(!wasPublished);
    expect(result.post.published).toBe(!wasPublished);

    if (result.published) {
      expect(result.publishedAt).toBeDefined();
      expect(result.message).toContain('published successfully');
    } else {
      expect(result.publishedAt).toBeNull();
      expect(result.message).toContain('unpublished successfully');
    }
  });

  it('should set publishedAt when publishing', async () => {
    if (!testPostId) {
      throw new Error('Test post not created');
    }

    // Ensure it's unpublished first
    const getResponse = await fetch(`${API_BASE}/${testPostId}`, {
      headers: { Cookie: authCookie },
    });
    const post: BlogPost = await getResponse.json();

    if (post.published) {
      // Unpublish first
      await fetch(`${API_BASE}/${testPostId}/publish`, {
        method: 'POST',
        headers: { Cookie: authCookie },
      });
    }

    // Publish
    const publishResponse = await fetch(`${API_BASE}/${testPostId}/publish`, {
      method: 'POST',
      headers: { Cookie: authCookie },
    });

    const result = await publishResponse.json();

    expect(result.published).toBe(true);
    expect(result.publishedAt).toBeDefined();
    expect(new Date(result.publishedAt)).toBeInstanceOf(Date);
  });
});

describe('Blog API - Delete', () => {
  it('should delete a blog post', async () => {
    // Create a post to delete
    const postToDelete = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie,
      },
      body: JSON.stringify({
        title: 'Post to Delete',
        slug: `post-to-delete-${Date.now()}`,
        content: 'This will be deleted',
      }),
    }).then(r => r.json());

    // Delete it
    const deleteResponse = await fetch(`${API_BASE}/${postToDelete.id}`, {
      method: 'DELETE',
      headers: { Cookie: authCookie },
    });

    expect(deleteResponse.status).toBe(200);

    const result = await deleteResponse.json();
    expect(result.success).toBe(true);

    // Verify it's gone
    const getResponse = await fetch(`${API_BASE}/${postToDelete.id}`, {
      headers: { Cookie: authCookie },
    });

    expect(getResponse.status).toBe(404);
  });

  it('should return 404 when deleting non-existent post', async () => {
    const response = await fetch(`${API_BASE}/non-existent-id`, {
      method: 'DELETE',
      headers: { Cookie: authCookie },
    });

    expect(response.status).toBe(404);
  });
});

describe('Blog API - Authorization', () => {
  it('should reject requests without authentication', async () => {
    const response = await fetch(API_BASE);
    expect(response.status).toBe(401);
  });

  it('should reject requests from non-admin users', async () => {
    // TODO: Implement test with customer/staff role
    // const customerCookie = await loginAsCustomer();
    // const response = await fetch(API_BASE, {
    //   headers: { Cookie: customerCookie },
    // });
    // expect(response.status).toBe(401);
  });
});

describe('Blog API - Edge Cases', () => {
  it('should handle empty tags array', async () => {
    const post = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie,
      },
      body: JSON.stringify({
        title: 'No Tags Post',
        slug: `no-tags-${Date.now()}`,
        content: 'Content',
        tags: [],
      }),
    }).then(r => r.json());

    expect(post.tags).toEqual([]);
  });

  it('should handle long content', async () => {
    const longContent = 'x'.repeat(100000); // 100k characters

    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie,
      },
      body: JSON.stringify({
        title: 'Long Content Post',
        slug: `long-content-${Date.now()}`,
        content: longContent,
      }),
    });

    expect(response.status).toBe(201);

    const post: BlogPost = await response.json();
    expect(post.content.length).toBe(longContent.length);
  });

  it('should handle pagination edge cases', async () => {
    // Page 0 should default to page 1
    const response1 = await fetch(`${API_BASE}?page=0`, {
      headers: { Cookie: authCookie },
    });
    const data1: BlogPostListResponse = await response1.json();
    expect(data1.pagination.page).toBeGreaterThanOrEqual(1);

    // Negative limit should use default
    const response2 = await fetch(`${API_BASE}?limit=-10`, {
      headers: { Cookie: authCookie },
    });
    const data2: BlogPostListResponse = await response2.json();
    expect(data2.pagination.limit).toBeGreaterThan(0);
  });
});
