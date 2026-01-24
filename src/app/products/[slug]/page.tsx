import Link from 'next/link';
import { fetchProductBySlug } from '@/app/actions';
import { notFound } from 'next/navigation';
import ProductRecommendations from '@/components/ProductRecommendations';
import ProductVariantSelector from '@/components/ProductVariantSelector';
import ProductImageGallery from '@/components/ProductImageGallery';
import ProductViewTracker from '@/components/analytics/ProductViewTracker';
import ProductInventoryAdjuster from '@/components/admin/ProductInventoryAdjuster';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const productData = await fetchProductBySlug(slug);

  if (!productData) {
    notFound();
  }

  const { product, variant, displayImages } = productData;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Analytics Tracking */}
      <ProductViewTracker product={product} variant={variant} />

      {/* Breadcrumb */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-slate-400">
            <Link href="/" className="hover:text-teal-400 transition-colors">
              Home
            </Link>
            <span>›</span>
            <Link href="/products" className="hover:text-teal-400 transition-colors">
              Products
            </Link>
            <span>›</span>
            <span className="text-white font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Images */}
            <ProductImageGallery 
              images={displayImages} 
              productName={product.name}
              featured={product.featured} 
            />

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {product.name}
                </h1>
                <p className="text-slate-400 text-lg leading-relaxed">{product.description}</p>
              </div>

              {/* Conservation Info */}
              {product.conservationPercentage > 0 && (
                <div className="bg-gradient-to-r from-teal-900/30 to-blue-900/30 border border-teal-800 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">🪼</span>
                    <div>
                      <h3 className="text-lg font-semibold text-teal-300">
                        Conservation Impact
                      </h3>
                      <p className="text-teal-400/90">
                        {product.conservationPercentage}% of this purchase supports ocean conservation
                      </p>
                    </div>
                  </div>
                  {product.conservationFocus && (
                    <p className="text-sm text-teal-300 bg-teal-950/50 rounded p-3 border border-teal-900">
                      <strong className="text-teal-200">Focus:</strong> {product.conservationFocus}
                    </p>
                  )}
                </div>
              )}

              <ProductVariantSelector
                product={product}
                variants={productData.variants}
                initialVariant={variant}
                displayImages={displayImages}
              />

              {/* Admin Inventory Adjustment - Only visible to admin users */}
              <ProductInventoryAdjuster
                productId={product.id}
                productName={product.name}
                variants={productData.variants}
              />

              <div className="space-y-4 pt-4">
                <Link
                  href="/products"
                  className="block w-full text-center border-2 border-teal-600 text-teal-400 py-4 rounded-lg font-semibold hover:bg-teal-900/20 transition-colors"
                >
                  ← Back to All Products
                </Link>
              </div>

              {/* Features */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-3">
                <h3 className="font-semibold text-white flex items-center gap-2 text-lg">
                  <span>🌊</span>
                  Why Choose La Pesqueria Outfitters
                </h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400 mt-0.5">✓</span>
                    <span>UPF 50+ sun protection for long days on the water</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400 mt-0.5">✓</span>
                    <span>Moisture-wicking and quick-dry fabric</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400 mt-0.5">✓</span>
                    <span>Built for Texas anglers, tested on the Gulf Coast</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400 mt-0.5">✓</span>
                    <span>Free shipping on orders over $50</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* You May Also Like - Product Recommendations */}
      <ProductRecommendations
        productId={product.id}
        limit={6}
        recommendationType="similar"
        title="You May Also Like"
        className="bg-slate-900 border-t border-slate-800"
      />

      {/* Conservation CTA */}
      <section className="bg-gradient-to-r from-teal-900 to-blue-900 py-12 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
            <span className="text-3xl">🪼</span>
            <h2 className="text-3xl font-bold text-white">
              Protect Ocean Life with Every Purchase
            </h2>
            <span className="text-3xl">🐙</span>
          </div>
          <p className="text-xl text-cyan-100 mb-6">
            Learn how your purchase supports sea turtles, whales, and marine ecosystems
            in South Padre Island and Rio Grande Valley
          </p>
          <Link
            href="/conservation"
            className="inline-block border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-teal-900 transition-all"
          >
            Our Conservation Mission
          </Link>
        </div>
      </section>
    </div>
  );
}