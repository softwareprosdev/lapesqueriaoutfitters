'use client'

import { TestimonialSection } from '@/components/TestimonialSection'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'

// Dynamic import for 3D Dashboard (SSR disabled for Three.js)
const FishingDashboard3D = dynamic(
  () => import('@/components/fishing-dashboard/FishingDashboard3D'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-gold/30 border-t-gold animate-spin" style={{ borderTopColor: '#D4AF37' }} />
          <p className="text-cyan-400 font-semibold">Loading Elite Dashboard</p>
        </div>
      </div>
    ),
  }
)
import { useEffect, useState } from 'react'
import { Fish, Anchor, ShieldCheck, ArrowRight, Sun, Droplets, Shirt } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import ParallaxBanner from '@/components/ParallaxBanner'
import { SaleBanner } from '@/components/SaleBanner'
import { fetchFeaturedProducts } from './actions'

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<{
    product: {
      id: string;
      name: string;
      description: string | null;
      slug: string;
      basePrice: number;
      featured: boolean;
    };
    displayPrice: number;
    displayStock: number;
    displayImages: string[];
  }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchFeaturedProducts(6).then((products) => {
      if (isMounted) {
        setFeaturedProducts(products);
        setIsLoading(false);
      }
    }).catch(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sale Banner */}
      <SaleBanner />

      {/* Hero Section with Image */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#001F3F]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#001F3F]/70 to-[#001F3F] z-10" />
          <Image
            src="/images/fishing.jpg"
            alt="Fishing gear and equipment"
            fill
            priority
            sizes="100vw"
            quality={85}
            className="object-cover opacity-50"
            style={{ objectPosition: 'center center' }}
          />
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-20 text-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Headline */}
            <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tight uppercase">
              Born on the Water. <span className="block text-[#FF4500]">Built for the Catch.</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed font-body">
              High-performance apparel for the modern angler.
            </p>

            {/* CTA Button */}
            <Link href="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block bg-[#FF4500] text-white px-12 py-5 rounded-md font-bold text-lg tracking-wide hover:bg-[#FF5722] transition-all shadow-2xl shadow-[#FF4500]/25 uppercase"
              >
                Shop the Collection
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-white/50 flex flex-col items-center gap-2"
        >
          <span className="text-xs uppercase tracking-widest font-medium">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent" />
        </motion.div>
      </section>

      {/* Featured Products - T-shirts Grid */}
      <section className="py-24 bg-[#F8FAFC] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative z-10 text-4xl md:text-5xl font-black text-[#001F3F] mb-4 tracking-tight uppercase"
            >
              Featured Collection
            </motion.h2>
            <p className="text-xl text-[#494949] max-w-2xl mx-auto">
              Performance fishing apparel built for long days on the water
            </p>
          </div>

          {isLoading && featuredProducts.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden animate-pulse">
                  <div className="h-80 bg-gray-200" />
                  <div className="p-8 space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-full" />
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                    <div className="flex justify-between items-center">
                      <div className="h-8 bg-gray-200 rounded w-20" />
                      <div className="h-6 bg-gray-100 rounded w-16" />
                    </div>
                    <div className="h-12 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4"><Fish className="w-16 h-16 mx-auto text-[#001F3F]" /></div>
              <p className="text-[#494949] text-lg">New collection coming soon</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredProducts.map((productDisplay, index) => (
              <motion.div
                key={productDisplay.product?.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden group transition-all hover:shadow-xl"
              >
                <div className="relative h-80 overflow-hidden">
                  {productDisplay.displayImages?.[0] ? (
                    <Image
                      src={productDisplay.displayImages[0]}
                      alt={productDisplay.product?.name || 'Product'}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="w-20 h-20 bg-[#001F3F]/10 rounded-full flex items-center justify-center">
                        <Shirt className="w-10 h-10 text-[#001F3F]" />
                      </div>
                    </div>
                  )}
                  {productDisplay.product?.featured && (
                    <div className="absolute top-6 right-6 bg-[#FF4500] text-white px-4 py-1.5 rounded text-xs font-bold uppercase tracking-widest shadow-lg">
                      Featured
                    </div>
                  )}
                  {/* Technical Badges */}
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    <span className="bg-white/90 backdrop-blur-sm text-[#001F3F] px-2 py-1 rounded text-xs font-bold">UPF 50+</span>
                    <span className="bg-white/90 backdrop-blur-sm text-[#001F3F] px-2 py-1 rounded text-xs font-bold">Moisture Wicking</span>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-[#001F3F] mb-3 group-hover:text-[#FF4500] transition-colors">
                    {productDisplay.product?.name || 'Product'}
                  </h3>
                  <p className="text-[#494949] mb-6 line-clamp-2 leading-relaxed">
                    {productDisplay.product?.description || 'Performance fishing apparel'}
                  </p>
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-3xl font-black text-[#001F3F]">
                      ${productDisplay.displayPrice}
                    </span>
                    <span className={cn(
                      "text-xs font-bold px-3 py-1 rounded uppercase tracking-wider",
                      productDisplay.displayStock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {productDisplay.displayStock > 0 ? 'In Stock' : 'Sold Out'}
                    </span>
                  </div>
                  <Link
                    href={`/products/${productDisplay.product?.slug || 'fishing-shirt'}`}
                    className="block w-full text-center bg-[#001F3F] text-white py-4 rounded font-bold transition-all hover:bg-[#002D5C] active:scale-95"
                  >
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          )}

          <div className="text-center mt-20">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-[#FF4500] font-bold text-lg hover:gap-4 transition-all uppercase"
            >
              View All Products <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Parallax Banner */}
      <ParallaxBanner
        src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&q=80"
        alt="Fishing boat at sunrise - Born on the Water, Built for the Catch"
        text="Gear Up for the Catch"
      />

      {/* Why Choose La Pesqueria Features Section */}
      <section className="bg-[#001F3F] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight uppercase">
              Why Choose La Pesqueria?
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Built by anglers, for anglers. Every stitch honors the tradition of the sea.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "UPF 50+ Protection",
                desc: "Maximum sun protection for long days on the water. Our fabric blocks 98% of harmful UV rays.",
                icon: Sun,
                color: "text-[#FF4500]",
                bg: "bg-[#FF4500]/10"
              },
              {
                title: "Moisture Wicking",
                desc: "Advanced moisture management keeps you cool and dry, even in the most demanding conditions.",
                icon: Droplets,
                color: "text-blue-400",
                bg: "bg-blue-500/10"
              },
              {
                title: "Salt-Resistant Fabric",
                desc: "Engineered to withstand saltwater, sun, and the rigors of serious fishing adventures.",
                icon: Anchor,
                color: "text-cyan-400",
                bg: "bg-cyan-500/10"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10, scale: 1.02 }}
                className="text-center bg-white/5 backdrop-blur-sm p-10 rounded-lg border border-white/10 hover:border-[#FF4500]/50 transition-all"
              >
                <div className={cn("w-20 h-20 mx-auto rounded-lg flex items-center justify-center mb-8", feature.bg)}>
                  <feature.icon className={cn("w-10 h-10", feature.color)} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-white/70 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium 3D Fishing Dashboard */}
      <section className="py-12 bg-gradient-to-b from-[#001F3F] to-[#0a2a4a]">
        <FishingDashboard3D />
      </section>

      {/* Testimonials */}
      <TestimonialSection />

      {/* Shop Categories CTA Section */}
      <section className="bg-[#F8FAFC] py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-[#001F3F] mb-4 tracking-tight uppercase">
              Shop by Category
            </h2>
            <p className="text-xl text-[#494949] max-w-2xl mx-auto">
              Everything you need for your next fishing adventure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "T-Shirts",
                desc: "Performance fishing shirts with UPF 50+ protection",
                href: "/products?category=tshirts",
                icon: Shirt
              },
              {
                title: "Hats",
                desc: "Sun protection and style for the serious angler",
                href: "/products?category=hats",
                icon: ShieldCheck
              },
              {
                title: "Gear",
                desc: "Essential fishing accessories and equipment",
                href: "/products?category=gear",
                icon: Anchor
              }
            ].map((category, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Link href={category.href}>
                  <div className="bg-white p-10 rounded-lg border-2 border-gray-200 hover:border-[#FF4500] transition-all shadow-md hover:shadow-xl">
                    <div className="w-16 h-16 bg-[#001F3F] rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#FF4500] transition-colors">
                      <category.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#001F3F] mb-3 group-hover:text-[#FF4500] transition-colors">{category.title}</h3>
                    <p className="text-[#494949] mb-6">{category.desc}</p>
                    <span className="inline-flex items-center gap-2 text-[#FF4500] font-bold uppercase text-sm group-hover:gap-4 transition-all">
                      Shop Now <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-[#001F3F] py-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight uppercase">
              Gear That Works as Hard as You Do
            </h2>
            <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              At La Pesqueria Outfitters, we build gear for the long haul. Born from the salt and the spray, we create apparel that works as hard as a deckhand but feels like a weekend staple.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/products"
                  className="inline-block bg-[#FF4500] text-white px-10 py-4 rounded font-bold text-lg hover:bg-[#FF5722] transition-all shadow-lg shadow-[#FF4500]/20 uppercase"
                >
                  Shop All Products
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/about"
                  className="inline-block border-2 border-white/30 backdrop-blur-sm text-white px-10 py-4 rounded font-bold text-lg hover:bg-white hover:text-[#001F3F] transition-all uppercase"
                >
                  Our Story
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Store Info */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: "Visit Our Store", val: "McAllen, TX", color: "text-[#FF4500]" },
              { label: "Address", val: "4400 N 23rd St #135", color: "text-white" },
              { label: "Follow Us", val: "@lapesqueria", color: "text-cyan-400" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-md p-8 rounded-lg border border-white/10"
              >
                <div className={cn("text-2xl font-black mb-2", stat.color)}>{stat.val}</div>
                <div className="text-white/70 font-medium tracking-wide">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Fishing Parallax Banner */}
      <ParallaxBanner
        src="https://images.unsplash.com/photo-1559825481-12a05cc00344?w=1920&q=80"
        alt="Fishing at Sunset"
        text="The Catch Awaits"
      />
    </div>
  );
}
