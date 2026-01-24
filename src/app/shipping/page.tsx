import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Shipping Information | La Pesqueria Outfitters",
  description: 'Fast and reliable shipping for fishing apparel and gear. Free shipping on orders over $50.',
};

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#001F3F] via-blue-900 to-[#001F3F] py-20 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1440 320%22%3E%3Cpath fill=%22%23ffffff%22 d=%22M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z%22%3E%3C/path%3E%3C/svg%3E')] bg-cover bg-bottom" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Shipping Information</h1>
          <p className="text-xl text-cyan-100 max-w-2xl mx-auto">
            Fast and secure shipping for fishing apparel and gear from McAllen, Texas.
          </p>
        </div>
      </section>

      {/* Shipping Methods */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-slate-900 rounded-2xl shadow-xl p-8 md:p-10 border-t-8 border-[#FF4500]">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Standard Shipping</h2>
                  <p className="text-[#FF4500] font-medium">Free on orders over $50</p>
                </div>
                <span className="text-3xl">🚛</span>
              </div>
              <ul className="space-y-4 text-slate-300 mb-8">
                <li className="flex items-center gap-3">
                  <span className="text-[#FF4500]">✓</span> Delivery in 5-7 business days
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#FF4500]">✓</span> $5.95 flat rate for orders under $50
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#FF4500]">✓</span> Fully tracked delivery
                </li>
              </ul>
            </div>

            <div className="bg-slate-900 rounded-2xl shadow-xl p-8 md:p-10 border-t-8 border-blue-500">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Express Shipping</h2>
                  <p className="text-blue-400 font-medium">Priority handling</p>
                </div>
                <span className="text-3xl">✈️</span>
              </div>
              <ul className="space-y-4 text-slate-300 mb-8">
                <li className="flex items-center gap-3">
                  <span className="text-blue-400">✓</span> Delivery in 2-3 business days
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-blue-400">✓</span> $12.95 flat rate
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-blue-400">✓</span> Priority order processing
                </li>
              </ul>
            </div>
          </div>

          {/* Processing Info */}
          <div className="bg-slate-900 rounded-2xl shadow-lg p-8 md:p-12 border border-slate-800">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="text-3xl">🎣</span> Order Processing
                </h2>
                <div className="space-y-4 text-slate-300 leading-relaxed">
                  <p>
                    Our fishing apparel is ready to ship from our McAllen warehouse.
                    Most orders are processed and shipped within <span className="font-bold text-white">1-2 business days</span>.
                  </p>
                  <p>
                    During peak fishing season or promotional periods, processing
                    time may be slightly longer. We&apos;ll keep you updated on
                    your order&apos;s status via email.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="text-3xl">🐟</span> Bulk & Team Orders
                </h2>
                <p className="text-slate-300 leading-relaxed">
                  Fishing teams, charter businesses, and bulk orders may require
                  additional processing time.
                </p>
                <ul className="space-y-2 text-sm text-slate-400 bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <li>• Contact us for bulk pricing</li>
                  <li>• Custom logo options available</li>
                  <li>• Processing: 3-5 business days for custom orders</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
              <div className="text-4xl mb-4">🌎</div>
              <h3 className="font-bold text-white mb-2">US Shipping Only</h3>
              <p className="text-sm text-slate-400">We currently ship throughout the United States. Free shipping on orders over $50 within the continental US.</p>
            </div>
            <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="font-bold text-white mb-2">Order Tracking</h3>
              <p className="text-sm text-slate-400">All shipments include tracking information. You&apos;ll receive an email with tracking details once your order ships.</p>
            </div>
            <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="font-bold text-white mb-2">P.O. Boxes</h3>
              <p className="text-sm text-slate-400">Yes! We ship to P.O. Boxes and military addresses (APO/FPO) via standard shipping.</p>
            </div>
          </div>

          {/* Help CTA */}
          <div className="mt-16 bg-[#001F3F] rounded-3xl p-10 text-center text-white shadow-xl border border-slate-800">
            <h2 className="text-2xl font-bold mb-4">Need Help with Shipping?</h2>
            <p className="text-cyan-100 mb-8 max-w-2xl mx-auto">
              Need help with shipping options or have special delivery requirements? We&apos;re here to help!
            </p>
            <Link
              href="/contact"
              className="inline-block bg-[#FF4500] text-white px-10 py-4 rounded-full font-bold hover:bg-[#FF5722] transition-all transform hover:scale-105"
            >
              Contact Shipping Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
