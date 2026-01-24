import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/db'
import AnimatedSection, { StaggeredChildren } from '@/components/AnimatedSection'
import { Anchor, Fish } from 'lucide-react'

export const metadata = {
  title: "The Captain's Log | La Pesqueria Outfitters",
  description: 'Fishing reports, gear guides, and product drops from La Pesqueria Outfitters in McAllen, TX. Your source for South Texas fishing news and apparel updates.'
}

export const revalidate = 3600 // Revalidate every hour

async function getBlogPosts() {
  try {
    return await prisma.blogPost.findMany({
      where: {
        published: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
    })
  } catch {
    // Return empty array if table doesn't exist yet (new database)
    return []
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts()

  const featuredPosts = posts.filter(post => post.featured)
  const recentPosts = posts.filter(post => !post.featured)

  // Blog categories for La Pesqueria
  const categories = [
    { name: 'Fishing Reports', slug: 'fishing-reports', icon: Fish },
    { name: 'Gear Guides', slug: 'gear-guides', icon: Anchor },
    { name: 'Product Drops', slug: 'product-drops', icon: Anchor },
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#001F3F]/10 to-transparent" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 bg-[#001F3F] pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="fadeInDown" className="text-center max-w-4xl mx-auto">
            <span className="inline-block py-1 px-3 rounded bg-[#FF4500]/20 text-[#FF4500] text-sm font-bold mb-6 uppercase tracking-wider">
              The Captain&apos;s Log
            </span>
            <h1 className="text-5xl md:text-7xl font-black mb-8 text-white tracking-tight uppercase">
              Stories from the Water
            </h1>
            <p className="text-xl md:text-2xl text-white/70 mb-10 leading-relaxed max-w-2xl mx-auto">
              Fishing reports, gear guides, and the latest product drops from La Pesqueria Outfitters.
            </p>
          </AnimatedSection>

          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/blog?category=${cat.slug}`}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-[#FF4500] text-white rounded font-bold text-sm uppercase tracking-wider transition-colors"
              >
                <cat.icon className="w-4 h-4" />
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="relative z-10 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection animation="fadeInUp" className="mb-12">
              <div className="flex items-center gap-4 mb-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                <h2 className="text-2xl font-black text-[#001F3F] uppercase tracking-wider">Featured Stories</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              </div>
            </AnimatedSection>

            <StaggeredChildren className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <article
                  key={post.id}
                  className="group relative h-[500px] rounded-lg overflow-hidden shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
                >
                  <div className="absolute inset-0">
                    {post.featuredImage ? (
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#001F3F] flex items-center justify-center">
                        <Anchor className="w-16 h-16 text-[#FF4500]" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  </div>

                  <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end text-white">
                    <div className="transform transition-transform duration-300 translate-y-4 group-hover:translate-y-0">
                      {post.category && (
                        <span className="inline-block px-4 py-1.5 rounded bg-[#FF4500] text-sm font-bold uppercase tracking-wider mb-4">
                          {post.category}
                        </span>
                      )}

                      <h3 className="text-3xl md:text-4xl font-black mb-4 leading-tight uppercase">
                        <Link href={`/blog/${post.slug}`} className="hover:text-[#FF4500] transition-colors">
                          {post.title}
                        </Link>
                      </h3>

                      <p className="text-white/80 mb-6 line-clamp-2 md:line-clamp-3 text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center gap-4 text-sm font-medium text-white/70">
                        <time>
                          {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </time>
                        <span>|</span>
                        <Link href={`/blog/${post.slug}`} className="text-[#FF4500] hover:text-white transition-colors flex items-center gap-2 uppercase font-bold">
                          Read More →
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </StaggeredChildren>
          </div>
        </section>
      )}

      {/* Recent Posts Grid */}
      <section className="relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fadeInUp" className="mb-12">
             <h2 className="text-3xl font-black text-[#001F3F] mb-2 uppercase">
               {featuredPosts.length > 0 ? 'Recent Posts' : 'All Posts'}
             </h2>
             <div className="h-1 w-20 bg-[#FF4500] rounded-full" />
          </AnimatedSection>

          {recentPosts.length > 0 ? (
            <StaggeredChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" staggerDelay={100}>
              {recentPosts.map((post) => (
                <article
                  key={post.id}
                  className="group bg-white rounded-lg overflow-hidden border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-64 overflow-hidden">
                    {post.featuredImage ? (
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#001F3F]/10 flex items-center justify-center">
                        <Fish className="w-12 h-12 text-[#001F3F]" />
                      </div>
                    )}
                    {post.category && (
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded bg-[#FF4500] text-xs font-bold text-white uppercase tracking-wider">
                          {post.category}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="text-sm text-[#494949] mb-3 flex items-center gap-2">
                      <time>
                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </time>
                    </div>

                    <h3 className="text-xl font-bold text-[#001F3F] mb-3 line-clamp-2 group-hover:text-[#FF4500] transition-colors">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>

                    <p className="text-[#494949] mb-4 line-clamp-3 text-sm leading-relaxed">
                      {post.excerpt}
                    </p>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center text-[#FF4500] font-bold text-sm hover:text-[#001F3F] transition-colors uppercase"
                    >
                      Read more
                      <svg className="w-4 h-4 ml-1 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </article>
              ))}
            </StaggeredChildren>
          ) : (
             <div className="col-span-full text-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-300">
               <Anchor className="w-12 h-12 mx-auto mb-4 text-[#001F3F]" />
               <h3 className="text-lg font-bold text-[#001F3F]">No posts yet</h3>
               <p className="text-[#494949]">Check back soon for fishing reports and gear guides.</p>
             </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[#001F3F]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection animation="fadeInUp">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight uppercase">
              Gear Up for Your Next Trip
            </h2>
            <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Premium fishing apparel designed for the modern angler. UPF 50+ protection, moisture-wicking fabric, and salt-resistant materials.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link
                href="/products"
                className="bg-[#FF4500] text-white px-8 py-4 rounded font-bold hover:bg-[#FF5722] hover:scale-105 transition-all shadow-lg uppercase"
              >
                Shop Collection
              </Link>
              <Link
                href="/about"
                className="group flex items-center justify-center px-8 py-4 rounded border-2 border-white/30 text-white font-bold hover:bg-white hover:text-[#001F3F] transition-all uppercase"
              >
                Our Story
                <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
