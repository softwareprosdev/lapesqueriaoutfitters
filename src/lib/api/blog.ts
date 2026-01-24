// Blog API Client
// Type-safe client functions for interacting with the blog management API

import type {
  BlogPost,
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
  BlogPostListParams,
  BlogPostListResponse,
  PublishToggleResponse,
  DeleteBlogPostResponse,
  BlogApiError,
} from '@/types/blog';

/**
 * Base API URL for blog endpoints
 */
const BLOG_API_BASE = '/api/admin/blog';

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error((data as BlogApiError).error || 'An error occurred');
  }

  return data as T;
}

/**
 * List all blog posts with optional filtering and pagination
 */
export async function listBlogPosts(
  params?: BlogPostListParams
): Promise<BlogPostListResponse> {
  const searchParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = `${BLOG_API_BASE}?${searchParams.toString()}`;
  return apiFetch<BlogPostListResponse>(url);
}

/**
 * Get a single blog post by ID
 */
export async function getBlogPost(id: string): Promise<BlogPost> {
  return apiFetch<BlogPost>(`${BLOG_API_BASE}/${id}`);
}

/**
 * Create a new blog post
 */
export async function createBlogPost(
  data: CreateBlogPostRequest
): Promise<BlogPost> {
  return apiFetch<BlogPost>(BLOG_API_BASE, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing blog post
 */
export async function updateBlogPost(
  id: string,
  data: UpdateBlogPostRequest
): Promise<BlogPost> {
  return apiFetch<BlogPost>(`${BLOG_API_BASE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Delete a blog post
 */
export async function deleteBlogPost(
  id: string
): Promise<DeleteBlogPostResponse> {
  return apiFetch<DeleteBlogPostResponse>(`${BLOG_API_BASE}/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Toggle the published status of a blog post
 */
export async function togglePublishStatus(
  id: string
): Promise<PublishToggleResponse> {
  return apiFetch<PublishToggleResponse>(`${BLOG_API_BASE}/${id}/publish`, {
    method: 'POST',
  });
}

/**
 * Get all published blog posts
 */
export async function getPublishedPosts(
  params?: Omit<BlogPostListParams, 'published'>
): Promise<BlogPostListResponse> {
  return listBlogPosts({ ...params, published: true });
}

/**
 * Get all draft blog posts
 */
export async function getDraftPosts(
  params?: Omit<BlogPostListParams, 'published'>
): Promise<BlogPostListResponse> {
  return listBlogPosts({ ...params, published: false });
}

/**
 * Get all featured blog posts
 */
export async function getFeaturedPosts(
  params?: Omit<BlogPostListParams, 'featured'>
): Promise<BlogPostListResponse> {
  return listBlogPosts({ ...params, featured: true });
}

/**
 * Search blog posts
 */
export async function searchBlogPosts(
  query: string,
  params?: Omit<BlogPostListParams, 'search'>
): Promise<BlogPostListResponse> {
  return listBlogPosts({ ...params, search: query });
}

/**
 * Get blog posts by category
 */
export async function getBlogPostsByCategory(
  category: string,
  params?: Omit<BlogPostListParams, 'category'>
): Promise<BlogPostListResponse> {
  return listBlogPosts({ ...params, category });
}

/**
 * Publish a blog post (if it's currently a draft)
 */
export async function publishBlogPost(id: string): Promise<BlogPost> {
  const post = await getBlogPost(id);

  if (post.published) {
    return post; // Already published
  }

  const response = await togglePublishStatus(id);
  return response.post;
}

/**
 * Unpublish a blog post (if it's currently published)
 */
export async function unpublishBlogPost(id: string): Promise<BlogPost> {
  const post = await getBlogPost(id);

  if (!post.published) {
    return post; // Already unpublished
  }

  const response = await togglePublishStatus(id);
  return response.post;
}

/**
 * Create a blog post as draft
 */
export async function createDraftPost(
  data: Omit<CreateBlogPostRequest, 'published'>
): Promise<BlogPost> {
  return createBlogPost({ ...data, published: false });
}

/**
 * Create and immediately publish a blog post
 */
export async function createPublishedPost(
  data: Omit<CreateBlogPostRequest, 'published'>
): Promise<BlogPost> {
  return createBlogPost({ ...data, published: true });
}

/**
 * Update only the content of a blog post
 */
export async function updateBlogPostContent(
  id: string,
  content: string
): Promise<BlogPost> {
  return updateBlogPost(id, { content });
}

/**
 * Update blog post metadata (everything except content)
 */
export async function updateBlogPostMetadata(
  id: string,
  metadata: Omit<UpdateBlogPostRequest, 'content'>
): Promise<BlogPost> {
  return updateBlogPost(id, metadata);
}

/**
 * Toggle featured status of a blog post
 */
export async function toggleFeaturedStatus(id: string): Promise<BlogPost> {
  const post = await getBlogPost(id);
  return updateBlogPost(id, { featured: !post.featured });
}
