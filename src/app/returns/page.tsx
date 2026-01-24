import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Returns & Exchanges | La Pesqueria Outfitters",
  description: 'Our 30-day return and exchange policy for fishing apparel and gear. Easy returns, customer satisfaction guaranteed.',
};

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#001F3F] via-blue-900 to-[#001F3F] py-20 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1440 320%22%3E%3Cpath fill=%22%23ffffff%22 d=%22M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z%22%3E%3C/path%3E%3C/svg%3E')] bg-cover bg-bottom" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Returns & Exchanges</h1>
          <p className="text-xl text-cyan-100 max-w-2xl mx-auto">
            Your satisfaction is our priority. Learn about our easy return process.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-2xl shadow-xl p-8 md:p-12 space-y-12 border border-slate-800">
            
            {/* 30-Day Policy */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">🔄</span> 30-Day Satisfaction Guarantee
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                We want you to be satisfied with your fishing apparel and gear.
                We offer a 30-day return policy from the date you receive your order. If you&apos;re not completely satisfied with your purchase,
                you can return it for a full refund or exchange.
              </p>
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h3 className="font-bold text-[#FF4500] mb-2">Eligibility for Returns:</h3>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li>• Items must be in original, unworn, unwashed condition</li>
                  <li>• Must include all original packaging and tags attached</li>
                  <li>• Custom or personalized items are final sale (unless defective)</li>
                </ul>
              </div>
            </div>

            <hr className="border-slate-700" />

            {/* Return Process */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">📦</span> How to Start a Return
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-[#FF4500] text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <h4 className="font-bold text-white">Contact Us</h4>
                  <p className="text-sm text-slate-400">Email info@lapesqueria.com with your order number.</p>
                </div>
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-[#FF4500] text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <h4 className="font-bold text-white">Pack It Up</h4>
                  <p className="text-sm text-slate-400">We&apos;ll provide you with a return authorization and shipping instructions.</p>
                </div>
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-[#FF4500] text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <h4 className="font-bold text-white">Get Refunded</h4>
                  <p className="text-sm text-slate-400">Once received, we&apos;ll process your refund within 5-7 business days.</p>
                </div>
              </div>
            </div>

            <hr className="border-slate-700" />

            {/* Exchanges */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">🤝</span> Easy Exchanges
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Need a different size or prefer a different style?
                Exchanges are free! Just contact us within 30 days, and we&apos;ll help you
                find the perfect fit.
              </p>
            </div>

            {/* Damaged Items */}
            <div className="bg-red-900/20 p-8 rounded-2xl border border-red-800/50">
              <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-3">
                <span className="text-2xl">⚠️</span> Damaged or Wrong Items
              </h2>
              <p className="text-red-300 leading-relaxed text-sm">
                In the rare case your fishing gear arrives damaged or we sent the wrong item,
                please contact us immediately. We&apos;ll send a replacement and cover all
                shipping costs to make it right.
              </p>
            </div>
          </div>

          {/* Help CTA */}
          <div className="mt-12 text-center">
            <p className="text-slate-400 mb-6">Have more questions about returns?</p>
            <Link
              href="/contact"
              className="inline-block bg-[#FF4500] text-white px-8 py-3 rounded-full font-bold hover:bg-[#FF5722] transition-all"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
