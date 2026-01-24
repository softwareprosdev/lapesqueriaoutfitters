import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import AnimatedSection, { StaggeredChildren } from '@/components/AnimatedSection';

interface TShirtProduct {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  basePrice: number;
  featured: boolean;
  conservationPercentage: number;
  conservationFocus: string | null;
  images: { url: string }[];
  variants: {
    id: string;
    price: number;
    stock: number;
    size: string | null;
    color: string | null;
  }[];
}

async function getTShirtProducts(): Promise<TShirtProduct[]> {
  try {
    // Find t-shirts category
    const category = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: 't-shirts' },
          { slug: 'tshirts' },
          { name: { contains: 'T-Shirt', mode: 'insensitive' } },
        ],
      },
    });

    if (!category) {
      return [];
    }

    const products = await prisma.product.findMany({
      where: {
        categoryId: category.id,
      },
      include: {
        images: {
          orderBy: { position: 'asc' },
        },
        variants: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return products;
  } catch {
    return [];
  }
}

export default async function TShirtsPage() {
  const products = await getTShirtProducts();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-[#001F3F] via-[#002D5C] to-[#003366] py-16 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1440 320%22%3E%3Cpath fill=%22%23ffffff%22 d=%22M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z%22%3E%3C/path%3E%3C/svg%3E')] bg-cover bg-bottom animate-pulse" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection animation="fadeInDown" className="text-center">
            <div className="text-6xl mb-4">👕</div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Premium Fishing Apparel
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
              {products.length > 0
                ? `${products.length} designs available`
                : 'Coming soon - premium fishing apparel'}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {products.length === 0 ? (
            <AnimatedSection animation="fadeInUp" className="text-center py-20">
              <div className="max-w-2xl mx-auto">
                <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 dark:from-blue-950/30 dark:via-blue-900/20 dark:to-blue-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-3xl p-12 shadow-lg">
                  <div className="text-7xl mb-6 animate-bounce">👕</div>
                  <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#001F3F] to-[#FF4500] mb-4">
                    Coming Soon!
                  </h2>
                  <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
                    Premium Fishing Apparel is on the way!
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    We&apos;re working on bringing you high-quality fishing shirts and apparel for the modern angler.
                    <span className="block mt-2 font-semibold text-[#001F3F] dark:text-blue-400">
                      Check back soon or explore our products!
                    </span>
                  </p>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#001F3F] to-[#FF4500] text-white px-8 py-4 rounded-full font-bold text-lg hover:from-[#002D5C] hover:to-[#FF5722] transition-all transform hover:scale-105 shadow-lg"
                  >
                    <span>🎣</span>
                    Shop Fishing Gear Now
                  </Link>
                </div>
              </div>
            </AnimatedSection>
          ) : (
            <StaggeredChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" staggerDelay={100}>
              {products.map((product) => {
                const totalStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
                const displayPrice = product.variants[0]?.price || product.basePrice || 0;
                const displayImage = product.images[0]?.url;

                return (
                  <div
                    key={product.id}
                    className="stagger-child bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-blue-100 dark:border-blue-900 group hover:-translate-y-2"
                  >
                    {/* Product Image */}
                    <div className="relative h-64 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 overflow-hidden">
                      {displayImage ? (
                        <Image
                          src={displayImage}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-6xl opacity-50">👕</div>
                        </div>
                      )}

                      {/* Featured Badge */}
                      {product.featured && (
                        <div className="absolute top-4 right-4 bg-[#001F3F] text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                          Featured
                        </div>
                      )}

                      {/* Stock Badge */}
                      {totalStock === 0 && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Out of Stock
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {product.description || 'Ocean-inspired t-shirt design'}
                      </p>

                      {/* Available Sizes */}
                      {product.variants.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Available sizes:</p>
                          <div className="flex flex-wrap gap-2">
                            {[...new Set(product.variants.map(v => v.size).filter(Boolean))].map((size) => (
                              <span
                                key={size}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded text-xs font-medium"
                              >
                                {size}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Price and Stock */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-[#001F3F] dark:text-blue-400">
                          ${displayPrice.toFixed(2)}
                        </span>
                        <span className={`text-sm px-3 py-1 rounded-full ${
                          totalStock > 0
                            ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                        }`}>
                          {totalStock > 0
                            ? `${totalStock} in stock`
                            : 'Out of Stock'}
                        </span>
                      </div>

                      {/* Conservation Info */}
                      {product.conservationPercentage > 0 && (
                        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-300">
                            <span>🌊</span>
                            <span className="font-semibold">
                              {product.conservationPercentage}% supports conservation
                            </span>
                          </div>
                          {product.conservationFocus && (
                            <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                              {product.conservationFocus}
                            </p>
                          )}
                        </div>
                      )}

                      {/* View Details Button */}
                      <Link
                        href={`/products/${product.slug}`}
                        className="block w-full text-center bg-[#001F3F] hover:bg-[#002D5C] text-white py-3 rounded-lg transition-all transform hover:scale-105 font-semibold"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </StaggeredChildren>
          )}
        </div>
      </section>

      {/* Conservation Info Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-[#001F3F] animate-ping" style={{ animationDuration: '4s' }} />
          <div className="absolute top-1/2 right-20 w-12 h-12 rounded-full bg-[#FF4500] animate-ping" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <AnimatedSection animation="fadeInUp">
            <div className="flex justify-center items-center gap-3 mb-4">
              <span className="text-3xl animate-bounce" style={{ animationDelay: '0.1s' }}>🐟</span>
              <span className="text-3xl animate-bounce" style={{ animationDelay: '0.2s' }}>👕</span>
              <h2 className="text-3xl font-bold text-[#001F3F] dark:text-blue-400">
                Premium Fishing Apparel
              </h2>
              <span className="text-3xl animate-bounce" style={{ animationDelay: '0.3s' }}>⚓</span>
              <span className="text-3xl animate-bounce" style={{ animationDelay: '0.4s' }}>🎣</span>
            </div>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              Every apparel purchase supports fishing communities and coastal conservation efforts.
            </p>
            <Link
              href="/"
              className="inline-block border-2 border-[#001F3F] dark:border-blue-400 text-[#001F3F] dark:text-blue-400 px-8 py-3 rounded-full font-semibold hover:bg-[#001F3F] hover:text-white dark:hover:bg-blue-400 dark:hover:text-slate-900 transition-all transform hover:scale-105"
            >
              Explore More Products
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
