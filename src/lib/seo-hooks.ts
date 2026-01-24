import { submitUrlsToIndexNow } from '@/lib/indexnow'

/**
 * Hook to automatically submit URLs to IndexNow when content is published
 * This should be called after successful creation/updates of public content
 */
export async function submitToSearchEngines(urls: string | string[]): Promise<void> {
  const urlArray = Array.isArray(urls) ? urls : [urls]

  try {
    await submitUrlsToIndexNow(urlArray)
  } catch (error) {
    // Don't fail the main operation if IndexNow submission fails
    console.error('IndexNow submission failed, but continuing:', error)
  }
}

/**
 * Submit a blog post URL to search engines
 */
export async function submitBlogPost(slug: string): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lapesqueria.com'
  const url = `${baseUrl}/blog/${slug}`
  await submitToSearchEngines(url)
}

/**
 * Submit a product URL to search engines
 */
export async function submitProduct(slug: string): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lapesqueria.com'
  const url = `${baseUrl}/products/${slug}`
  await submitToSearchEngines(url)
}

/**
 * Submit the sitemap URL to search engines (for comprehensive indexing)
 */
export async function submitSitemap(): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lapesqueria.com'
  const sitemapUrl = `${baseUrl}/sitemap.xml`
  await submitToSearchEngines(sitemapUrl)
}