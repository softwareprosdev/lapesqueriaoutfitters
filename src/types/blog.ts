// Blog API Type Definitions
// TypeScript types for blog management API requests and responses

/**
 * Blog Post Author Information
 * Included in blog post responses
 */
export interface BlogAuthor {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

/**
 * Complete Blog Post
 * Returned from GET endpoints
 */
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  category: string | null;
  tags: string[];
  featured: boolean;
  published: boolean;
  publishedAt: Date | null;
  authorId: string;
  author: BlogAuthor;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create Blog Post Request Body
 * Used for POST /api/admin/blog
 */
export interface CreateBlogPostRequest {
  title: string; // Required
  slug: string; // Required, must be unique
  content: string; // Required
  excerpt?: string;
  featuredImage?: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
  published?: boolean;
}

/**
 * Update Blog Post Request Body
 * Used for PUT /api/admin/blog/[id]
 * All fields are optional
 */
export interface UpdateBlogPostRequest {
  title?: string;
  slug?: string; // Must be unique if changed
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
  published?: boolean;
}

/**
 * Blog Post List Query Parameters
 * Used for GET /api/admin/blog
 */
export interface BlogPostListParams {
  page?: number; // Default: 1
  limit?: number; // Default: 10
  published?: boolean; // Filter by published status
  category?: string; // Filter by category
  featured?: boolean; // Filter by featured status
  search?: string; // Search in title, excerpt, content, tags
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'title'; // Default: createdAt
  sortOrder?: 'asc' | 'desc'; // Default: desc
}

/**
 * Pagination Metadata
 * Included in list responses
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Blog Post List Response
 * Returned from GET /api/admin/blog
 */
export interface BlogPostListResponse {
  posts: BlogPost[];
  pagination: PaginationMeta;
}

/**
 * Publish Toggle Response
 * Returned from POST /api/admin/blog/[id]/publish
 */
export interface PublishToggleResponse {
  success: boolean;
  published: boolean;
  publishedAt: Date | null;
  message: string;
  post: BlogPost;
}

/**
 * Delete Blog Post Response
 * Returned from DELETE /api/admin/blog/[id]
 */
export interface DeleteBlogPostResponse {
  success: boolean;
}

/**
 * API Error Response
 * Returned for all error cases
 */
export interface BlogApiError {
  error: string;
}

/**
 * Blog Post Status
 * Helper enum for filtering
 */
export enum BlogPostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

/**
 * Blog Post Sort Fields
 * Valid fields for sorting
 */
export type BlogPostSortField = 'createdAt' | 'updatedAt' | 'publishedAt' | 'title';

/**
 * Sort Order
 * Valid sort directions
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Type guard to check if response is an error
 */
export function isBlogApiError(response: unknown): response is BlogApiError {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    typeof (response as BlogApiError).error === 'string'
  );
}

/**
 * Helper type for blog post without author relation
 * Useful for internal operations
 */
export type BlogPostWithoutAuthor = Omit<BlogPost, 'author'>;

/**
 * Helper type for partial blog post (create/update)
 */
export type PartialBlogPost = Partial<BlogPostWithoutAuthor>;
