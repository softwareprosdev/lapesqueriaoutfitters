import Link from 'next/link';
import Image from 'next/image';
import { fetchProducts } from '@/app/actions';
import ParallaxBanner from '@/components/ParallaxBanner';
import AnimatedSection, { StaggeredChildren } from '@/components/AnimatedSection';
import { prisma } from '@/lib/prisma';
import { Tag, Clock, Percent } from 'lucide-react';

interface DiscountCode {
  code: string;
  type: string;
  value: number;
  description: string | null;
  expiresAt: Date | null;
  minPurchaseAmount: number | null;
}

interface ProductsPageProps {
  searchParams: Promise<{ category?: string }>;
}

async function getActiveDiscounts(): Promise<DiscountCode[]> {
  try {
    const now = new Date();
    const discounts = await prisma.discountCode.findMany({
      where: {
        isActive: true,
        OR: [
          { startsAt: null },
          { startsAt: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: now } },
            ],
          },
        ],
      },
      select: {
        code: true,
        type: true,
        value: true,
        description: true,
        expiresAt: true,
        minPurchaseAmount: true,
      },
      orderBy: {
        value: 'desc',
      },
      take: 3,
    });
    return discounts;
  } catch {
    return [];
  }
}

function DiscountBanner({ discounts }: { discounts: DiscountCode[] }) {
  if (discounts.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 py-3 border-b border-amber-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-4 text-white">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            <span className="font-bold text-sm sm:text-base">Active Discounts:</span>
          </div>
          {discounts.map((discount) => (
            <div
              key={discount.code}
              className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10"
            >
              <Percent className="w-4 h-4" />
              <span className="font-mono font-bold text-sm">{discount.code}</span>
              <span className="text-xs opacity-90">
                {discount.type === 'PERCENTAGE'
                  ? `${discount.value}% OFF`
                  : discount.type === 'FIXED_AMOUNT'
                  ? `$${discount.value} OFF`
                  : 'FREE SHIPPING'}
              </span>
              {discount.expiresAt && (
                <span className="flex items-center gap-1 text-xs opacity-75">
                  <Clock className="w-3 h-3" />
                  Ends {new Date(discount.expiresAt).toLocaleDateString()}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const categorySlug = params.category;

  // Fetch category if specified
  let category = null;
  if (categorySlug) {
    category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });
  }

  // Build filter object for products (use category ID in the filter)
  const filters = category ? { category: category.id } : {};

  const [{ data: products, total }, discounts] = await Promise.all([
    fetchProducts(filters, { page: 1, limit: 50 }),
    getActiveDiscounts(),
  ]);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-cyan-900 via-blue-900 to-teal-900 py-16 relative overflow-hidden border-b border-slate-800">
        {/* Animated wave background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1440 320%22%3E%3Cpath fill=%22%23ffffff%22 d=%22M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z%22%3E%3C/path%3E%3C/svg%3E')] bg-cover bg-bottom animate-pulse" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection animation="fadeInDown" className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-white">
               {category ? category.name : 'Fishing Essentials'}
            </h1>
            <p className="text-xl text-cyan-100 max-w-2xl mx-auto mb-8">
              {category 
                ? `${total} ${category.name.toLowerCase()} available` 
                : `${total} handcrafted pieces available`}
            </p>

            {/* Category Navigation Buttons */}
            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {/* All Products */}
              <Link
                href="/products"
                className="group flex items-center gap-2 bg-slate-800 text-teal-400 px-6 py-3 rounded-full font-bold text-sm sm:text-base transition-all duration-300 hover:scale-105 hover:bg-slate-700 shadow-lg border border-slate-700"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">🎣</span>
                <span>All Products</span>
              </Link>

              {/* T-Shirts */}
              <Link
                href="/products?category=tshirts"
                className="group flex items-center gap-2 bg-slate-800/50 text-slate-300 hover:text-teal-400 px-6 py-3 rounded-full font-bold text-sm sm:text-base transition-all duration-300 hover:scale-105 hover:bg-slate-800 border border-slate-700 hover:border-teal-500/50"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">👕</span>
                <span>T-Shirts</span>
              </Link>

              {/* Performance Shirts */}
              <Link
                href="/products?category=performance-shirts"
                className="group flex items-center gap-2 bg-slate-800/50 text-slate-300 hover:text-teal-400 px-6 py-3 rounded-full font-bold text-sm sm:text-base transition-all duration-300 hover:scale-105 hover:bg-slate-800 border border-slate-700 hover:border-teal-500/50"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">🏃</span>
                <span>Performance</span>
              </Link>

              {/* Hats */}
              <Link
                href="/products?category=hats"
                className="group flex items-center gap-2 bg-slate-800/50 text-slate-300 hover:text-teal-400 px-6 py-3 rounded-full font-bold text-sm sm:text-base transition-all duration-300 hover:scale-105 hover:bg-slate-800 border border-slate-700 hover:border-teal-500/50"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">🧢</span>
                <span>Hats</span>
              </Link>

              {/* Hoodies */}
              <Link
                href="/products?category=hoodies"
                className="group flex items-center gap-2 bg-slate-800/50 text-slate-300 hover:text-teal-400 px-6 py-3 rounded-full font-bold text-sm sm:text-base transition-all duration-300 hover:scale-105 hover:bg-slate-800 border border-slate-700 hover:border-teal-500/50"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">🧥</span>
                <span>Hoodies</span>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Discount Codes Banner */}
      <DiscountBanner discounts={discounts} />

      {/* Fishing Parallax Banner */}
      <ParallaxBanner
        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80"
        alt="Fishing at sunrise"
        text="Premium Fishing Gear"
      />

      {/* Products Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {products.length === 0 ? (
            <AnimatedSection animation="fadeInUp" className="text-center py-20">
              {category && ['tshirts', 'performance-shirts', 'hats', 'hoodies', 'polos'].includes(category.slug) ? (
                /* Coming Soon for New Categories */
                <div className="max-w-2xl mx-auto">
                  <div className="bg-gradient-to-br from-cyan-950/30 via-blue-950/30 to-teal-950/30 border-2 border-cyan-800 rounded-3xl p-12 shadow-lg">
                    <div className="text-7xl mb-6 animate-bounce">🎣</div>
                    <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400 mb-4">
                      Coming Soon!
                    </h2>
                    <p className="text-xl text-slate-300 mb-6">
                      {category.name} are on the way!
                    </p>
                    <p className="text-slate-400 mb-8">
                      We're working on bringing you quality fishing apparel and gear that support our local angling community.
                      <span className="block mt-2 font-semibold text-teal-400">
                        Check back soon or explore our other products!
                      </span>
                    </p>
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-cyan-500 hover:to-teal-500 transition-all transform hover:scale-105 shadow-lg"
                    >
                      <span>🎣</span>
                      Shop All Products
                    </Link>
                  </div>
                </div>
              ) : (
                /* Generic No Products */
                <>
                  <div className="text-6xl mb-4 animate-bounce">🎣</div>
                  <h2 className="text-2xl font-semibold text-slate-300 mb-2">
                    No products available yet
                  </h2>
                  <p className="text-slate-400">
                    Check back soon for our fishing apparel and gear!
                  </p>
                </>
              )}
            </AnimatedSection>
          ) : (
            <StaggeredChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" staggerDelay={100}>
              {products.map((productDisplay) => (
                <div
                  key={productDisplay.product.id}
                  className="stagger-child bg-slate-900 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-800 hover:border-teal-700/50 group hover:-translate-y-2"
                >
                  {/* Product Image */}
                  <div className="relative h-64 bg-gradient-to-br from-cyan-950/30 to-blue-950/30 overflow-hidden">
                    {productDisplay.displayImages?.[0] ? (
                      <Image
                        src={productDisplay.displayImages[0]}
                        alt={productDisplay.product.name}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        quality={80}
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="eager"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-6xl opacity-50">🌊</div>
                      </div>
                    )}

                    {/* Featured Badge */}
                    {productDisplay.product.featured && (
                      <div className="absolute top-4 right-4 bg-rose-600 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse shadow-lg">
                         Featured
                      </div>
                    )}

                    {/* Stock Badge */}
                    {productDisplay.displayStock === 0 && (
                      <div className="absolute top-4 left-4 bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-sm font-semibold border border-slate-700">
                        Out of Stock
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-2 truncate">
                      {productDisplay.product.name}
                    </h3>
                    <p className="text-slate-400 mb-4 line-clamp-2 text-sm">
                      {productDisplay.product.description || 'Premium fishing apparel and gear for the modern angler'}
                    </p>

                    {/* Price and Stock */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-teal-400">
                        ${productDisplay.displayPrice.toFixed(2)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        productDisplay.displayStock > 0
                          ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-900/50'
                          : 'bg-rose-900/30 text-rose-400 border border-rose-900/50'
                      }`}>
                        {productDisplay.displayStock > 0
                          ? `${productDisplay.displayStock} in stock`
                          : 'Out of Stock'}
                      </span>
                    </div>



                    {/* View Details Button */}
                    <Link
                      href={`/products/${productDisplay.product.slug}`}
                      className="block w-full text-center bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg transition-all transform hover:scale-105 font-semibold shadow-lg shadow-teal-900/20"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </StaggeredChildren>
          )}
        </div>
      </section>

      {/* Fishing Parallax Banner */}
      <ParallaxBanner 
        src="https://images.unsplash.com/photo-1676395245813-9cd304454501?w=1920&q=80" 
        alt="Fishing boat"
        text="Built for the Catch" 
      />


    </div>
  );
}