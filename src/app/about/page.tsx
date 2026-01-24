import Link from 'next/link'
import AnimatedSection, { StaggeredChildren } from '@/components/AnimatedSection'
import ParallaxBanner from '@/components/ParallaxBanner'
import { Anchor, Fish, Sun, Shield, Truck, Users } from 'lucide-react'

export const metadata = {
  title: 'Our Story | La Pesqueria Outfitters - McAllen TX Fishing Apparel',
  description: 'At La Pesqueria Outfitters, we build gear for the long haul. Born from the salt and the spray, we create T-shirts that work as hard as a deckhand but feel like a weekend staple.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="bg-[#001F3F] py-20 relative overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 304 304%22 width=%22304%22 height=%22304%22%3E%3Cpath fill=%22%23FFFFFF%22 d=%22M44.1 224a5 5 0 1 1 0 2H0v-2h44.1zm160 48a5 5 0 1 1 0 2H82v-2h122.1z%22/%3E%3C/svg%3E')] bg-repeat" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <AnimatedSection animation="fadeInDown">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight uppercase">
              Our Story
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-4xl mx-auto leading-relaxed">
              At La Pesqueria Outfitters, we build gear for the long haul. Born from the salt and the spray,
              we create T-shirts that work as hard as a deckhand but feel like a weekend staple.
              Every stitch honors the tradition of the sea.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection animation="fadeInLeft">
              <h2 className="text-3xl font-black text-[#001F3F] mb-6 uppercase">
                How La Pesqueria Began
              </h2>
              <div className="space-y-4 text-[#494949] leading-relaxed">
                <p>
                  La Pesqueria Outfitters was born in the Rio Grande Valley, where the water meets the land
                  and fishing isn&apos;t just a hobby—it&apos;s a way of life. We started with a simple idea:
                  create apparel that could handle the demands of serious anglers while looking good enough
                  to wear anywhere.
                </p>
                <p>
                  Our founders spent years on the water, from the bays of South Padre Island to the
                  offshore runs in the Gulf. They knew what worked and what didn&apos;t. Too many shirts
                  faded after a few washes. Too many hats couldn&apos;t stand up to the salt. That had to change.
                </p>
                <p>
                  <strong className="text-[#FF4500]">Today, we&apos;re proud to offer premium fishing apparel</strong> designed
                  for the modern angler. UPF 50+ protection, moisture-wicking fabric, salt-resistant materials—all
                  built to last and styled for the lifestyle we love.
                </p>
              </div>
            </AnimatedSection>
            <AnimatedSection animation="fadeInRight" delay={200}>
              <div className="bg-[#001F3F] rounded-lg p-8 shadow-lg">
                <div className="text-center">
                  <div className="w-20 h-20 bg-[#FF4500]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Anchor className="w-10 h-10 text-[#FF4500]" />
                  </div>
                  <div className="text-2xl font-black text-white mb-2 uppercase">
                    Built for the Water
                  </div>
                  <div className="text-lg text-white/70">
                    4400 N 23rd St Suite 135, McAllen, TX
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Parallax Banner */}
      <ParallaxBanner
        src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&q=80"
        alt="Fishing at sunrise"
        text="Born on the Water"
      />

      {/* What We Offer Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fadeInUp" className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-[#001F3F] mb-4 uppercase">
              What Sets Us Apart
            </h2>
            <p className="text-xl text-[#494949] max-w-3xl mx-auto">
              Premium fishing apparel engineered for performance and built to last.
            </p>
          </AnimatedSection>

          <StaggeredChildren className="grid grid-cols-1 md:grid-cols-3 gap-8" staggerDelay={150}>
            <div className="stagger-child text-center bg-[#F8FAFC] p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-16 h-16 bg-[#FF4500]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sun className="w-8 h-8 text-[#FF4500]" />
              </div>
              <h3 className="text-xl font-bold text-[#001F3F] mb-2">
                UPF 50+ Protection
              </h3>
              <p className="text-[#494949] leading-relaxed">
                Maximum sun protection that blocks 98% of harmful UV rays.
                Stay protected during those long days chasing the big one.
              </p>
            </div>

            <div className="stagger-child text-center bg-[#F8FAFC] p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-16 h-16 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Fish className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-[#001F3F] mb-2">
                Moisture Wicking
              </h3>
              <p className="text-[#494949] leading-relaxed">
                Advanced fabric technology pulls sweat away from your body,
                keeping you cool and dry even in the Texas heat.
              </p>
            </div>

            <div className="stagger-child text-center bg-[#F8FAFC] p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-16 h-16 bg-cyan-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-cyan-500" />
              </div>
              <h3 className="text-xl font-bold text-[#001F3F] mb-2">
                Salt-Resistant Fabric
              </h3>
              <p className="text-[#494949] leading-relaxed">
                Engineered to withstand saltwater, sun, and the rigors
                of serious fishing without fading or breaking down.
              </p>
            </div>
          </StaggeredChildren>
        </div>
      </section>

      {/* Parallax Banner */}
      <ParallaxBanner
        src="https://images.unsplash.com/photo-1534590227743-096882d2d300?w=1920&q=80"
        alt="Fishing gear and equipment"
        text="Gear Up for Adventure"
      />

      {/* Values Section */}
      <section className="bg-[#001F3F] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fadeInUp" className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-4 uppercase">
              Our Commitment
            </h2>
            <p className="text-white/70 max-w-3xl mx-auto">
              Every piece of gear we make reflects our values: quality, durability, and a deep respect for the water.
            </p>
          </AnimatedSection>

          <StaggeredChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={100}>
            <div className="stagger-child text-center group">
              <div className="w-16 h-16 bg-[#FF4500]/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Anchor className="w-8 h-8 text-[#FF4500]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Quality First</h3>
              <p className="text-white/60">
                Premium materials and construction that stands up to real-world use.
              </p>
            </div>

            <div className="stagger-child text-center group">
              <div className="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Local Pride</h3>
              <p className="text-white/60">
                Proudly serving the Rio Grande Valley and anglers everywhere.
              </p>
            </div>

            <div className="stagger-child text-center group">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Truck className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Fast Shipping</h3>
              <p className="text-white/60">
                Quick delivery so you can get on the water sooner.
              </p>
            </div>

            <div className="stagger-child text-center group">
              <div className="w-16 h-16 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Satisfaction Guaranteed</h3>
              <p className="text-white/60">
                If you&apos;re not happy, we&apos;ll make it right. Period.
              </p>
            </div>
          </StaggeredChildren>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-[#F8FAFC] py-16 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <AnimatedSection animation="fadeInUp">
            <h2 className="text-3xl font-black text-[#001F3F] mb-4 uppercase">
              Ready to Gear Up?
            </h2>
            <p className="text-xl text-[#494949] mb-8">
              Shop our collection of premium fishing apparel and experience the La Pesqueria difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="inline-block bg-[#FF4500] text-white px-8 py-3 rounded font-bold hover:bg-[#FF5722] transition-all transform hover:scale-105 shadow-lg uppercase"
              >
                Shop Collection
              </Link>
              <Link
                href="/contact"
                className="inline-block border-2 border-[#001F3F] text-[#001F3F] px-8 py-3 rounded font-bold hover:bg-[#001F3F] hover:text-white transition-all uppercase"
              >
                Visit Our Store
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
