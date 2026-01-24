/**
 * Blog Management API - Index
 *
 * This file serves as a central export point for blog-related functionality.
 * Note: API routes are handled by Next.js file-based routing, not this file.
 *
 * For API implementation, see:
 * - route.ts (main list/create endpoints)
 * - [id]/route.ts (get/update/delete endpoints)
 * - [id]/publish/route.ts (publish toggle endpoint)
 *
 * For TypeScript types and client, use:
 * @example
 * import { BlogPost, CreateBlogPostRequest } from '@/types/blog';
 * import { createBlogPost, listBlogPosts } from '@/lib/api/blog';
 */

/**
 * This file intentionally left minimal.
 *
 * API routes are auto-discovered by Next.js based on file structure:
 * - GET/POST  /api/admin/blog          → route.ts
 * - GET/PUT/DELETE /api/admin/blog/[id] → [id]/route.ts
 * - POST      /api/admin/blog/[id]/publish → [id]/publish/route.ts
 */

export const BLOG_API_VERSION = '1.0.0';
export const BLOG_API_BASE_PATH = '/api/admin/blog';

/**
 * API Route Paths
 */
export const BLOG_ROUTES = {
  list: `${BLOG_API_BASE_PATH}`,
  create: `${BLOG_API_BASE_PATH}`,
  get: (id: string) => `${BLOG_API_BASE_PATH}/${id}`,
  update: (id: string) => `${BLOG_API_BASE_PATH}/${id}`,
  delete: (id: string) => `${BLOG_API_BASE_PATH}/${id}`,
  publish: (id: string) => `${BLOG_API_BASE_PATH}/${id}/publish`,
} as const;

/**
 * Documentation Files
 */
export const BLOG_DOCS = {
  readme: 'README.md',
  examples: 'EXAMPLES.md',
  quickRef: 'QUICK_REFERENCE.md',
  summary: 'IMPLEMENTATION_SUMMARY.md',
} as const;

// Re-export types for convenience (optional)
export type {
  BlogPost,
  BlogAuthor,
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
  BlogPostListParams,
  BlogPostListResponse,
  PublishToggleResponse,
  DeleteBlogPostResponse,
  BlogApiError,
  PaginationMeta,
} from '@/types/blog';

// Re-export client functions for convenience (optional)
export {
  listBlogPosts,
  getBlogPost,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  togglePublishStatus,
  getPublishedPosts,
  getDraftPosts,
  getFeaturedPosts,
  searchBlogPosts,
  getBlogPostsByCategory,
} from '@/lib/api/blog';
