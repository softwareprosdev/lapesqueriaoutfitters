import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Frequently Asked Questions | La Pesqueria Outfitters",
  description: 'Find answers to common questions about our fishing apparel, shipping, returns, and conservation efforts.',
}

const faqs = [
  {
    question: 'What sizes are available for your apparel?',
    answer: 'Our t-shirts and hoodies come in sizes XS through 3XL. We recommend checking the size guide on each product page for exact measurements. Most shirts have a relaxed fit designed for comfort while fishing.'
  },
  {
    question: 'Are your performance shirts really UPF 50+?',
    answer: 'Yes! Our performance fishing shirts are tested and rated UPF 50+, blocking 98% of harmful UV rays. Perfect for long days on the water in the South Texas sun.'
  },
  {
    question: 'Do you offer custom team or business orders?',
    answer: 'Absolutely! We work with fishing teams, charter businesses, and events. Contact us for bulk pricing and custom logo options for your crew or company.'
  },
  {
    question: 'How much of each purchase goes to conservation?',
    answer: '10% of every purchase is donated directly to local marine conservation organizations in the Rio Grande Valley and South Padre Island area, supporting habitat restoration and marine life protection.'
  },
  {
    question: 'Where do you ship to?',
    answer: 'We currently ship throughout the United States. Free shipping on orders over $50 within the continental US.'
  },
  {
    question: 'How long does shipping take?',
    answer: 'Standard shipping (5-7 business days) and Express shipping (2-3 business days) are available. All orders are processed within 1-2 business days.'
  },
  {
    question: 'What is your return policy?',
    answer: 'We offer a 30-day return policy for unworn, unwashed items in original condition with tags attached. Please contact us within 30 days of receiving your order to initiate a return.'
  },
  {
    question: 'How do I care for my performance shirt?',
    answer: 'Machine wash cold with like colors. Tumble dry low or hang dry. Do not use fabric softener as it can reduce the UPF rating over time. Do not bleach.'
  },
  {
    question: 'Are your hats salt-resistant?',
    answer: 'Yes! Our caps and hats feature salt-resistant treatments and are designed to handle exposure to saltwater and sun. Simply rinse with fresh water after salty conditions and air dry.'
  },
  {
    question: 'Do you offer gift cards?',
    answer: 'Yes! Gift cards are available in any denomination. Perfect for the angler in your life who has everything.'
  }
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#001F3F] via-blue-900 to-[#001F3F] py-16 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1440 320%22%3E%3Cpath fill=%22%23ffffff%22 d=%22M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z%22%3E%3C/path%3E%3C/svg%3E')] bg-cover bg-bottom" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-cyan-100 max-w-2xl mx-auto">
            Find answers to common questions about our fishing apparel, gear, and conservation mission.
          </p>
        </div>
      </section>

      {/* FAQ Grid */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-slate-900 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all border border-slate-800">
                <div className="p-6 md:p-8">
                  <h3 className="text-xl font-bold text-white mb-4 flex gap-4">
                    <span className="text-[#FF4500]">Q:</span>
                    {faq.question}
                  </h3>
                  <div className="flex gap-4">
                    <span className="text-blue-500 font-bold">A:</span>
                    <p className="text-slate-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-[#001F3F] border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Didn't Find Your Answer?</h2>
          <p className="text-lg text-cyan-100 mb-8">
            We're here to help with any questions about our fishing apparel or conservation efforts.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-[#FF4500] text-white px-10 py-4 rounded-full font-bold hover:bg-[#FF5722] transition-all transform hover:scale-105"
          >
            Contact Customer Support
          </Link>
        </div>
      </section>
    </div>
  )
}
