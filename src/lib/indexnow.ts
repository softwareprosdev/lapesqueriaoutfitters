import { IndexNowSubmitter } from 'indexnow-submitter'

export interface IndexNowOptions {
  urls: string[]
  keyLocation?: string
}

/**
 * Submit URLs to IndexNow for faster indexing by Bing, Yandex, and other search engines
 * @param options - URLs to submit and optional key location
 */
export async function submitToIndexNow(options: IndexNowOptions): Promise<void> {
  try {
    const key = process.env.INDEXNOW_KEY
    const host = process.env.NEXT_PUBLIC_SITE_URL || 'https://lapesqueria.com'

    if (!key) {
      console.warn('INDEXNOW_KEY not configured, skipping IndexNow submission')
      return
    }

    const submitter = new IndexNowSubmitter({
      key,
      host,
      keyPath: options.keyLocation || `https://${host}/${key}.txt`
    })

    await submitter.submitUrls(options.urls)

    console.log(`✅ Successfully submitted ${options.urls.length} URLs to IndexNow`)
  } catch (error) {
    console.error('❌ Failed to submit URLs to IndexNow:', error)
  }
}

/**
 * Submit a single URL to IndexNow
 * @param url - URL to submit
 */
export async function submitUrlToIndexNow(url: string): Promise<void> {
  await submitToIndexNow({ urls: [url] })
}

/**
 * Submit multiple URLs to IndexNow (batched)
 * @param urls - Array of URLs to submit
 */
export async function submitUrlsToIndexNow(urls: string[]): Promise<void> {
  // IndexNow has a limit of 10,000 URLs per submission, so we batch them
  const batchSize = 100
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize)
    await submitToIndexNow({ urls: batch })
  }
}