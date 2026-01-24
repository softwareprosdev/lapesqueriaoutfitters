import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { BlogContentEnhancer } from '@/components/blog/BlogContentEnhancer'
import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'

export const revalidate = 3600

export async function generateStaticParams() {
  try {
    const posts = await prisma.blogPost.findMany({
      select: {
        slug: true,
      },
      where: {
        published: true,
      },
    })

    return posts.map((post) => ({
      slug: post.slug,
    }))
  } catch {
    return []
  }
}

async function getBlogPost(slug: string) {
  try {
    return await prisma.blogPost.findUnique({
      where: { slug },
    })
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    return {
      title: "Post Not Found | La Pesqueria Outfitters Blog",
    }
  }

  return {
    title: `${post.title} | La Pesqueria Outfitters Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage ? [post.featuredImage] : [],
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post || !post.published) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      <BlogContentEnhancer 
        title={post.title}
        featuredImage={post.featuredImage || undefined}
        category={post.category || undefined}
      >
        <MDXRemote 
          source={post.content || ''} 
          options={{
            mdxOptions: {
              remarkPlugins: [
                remarkGfm,
                remarkBreaks
              ],
              rehypePlugins: [
                rehypeSlug,
                rehypeHighlight
              ]
            }
          }}
        />
      </BlogContentEnhancer>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <Link
          href="/blog"
          className="inline-flex items-center text-teal-600 hover:text-teal-700 font-semibold transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </Link>
      </div>
    </div>
  )
}