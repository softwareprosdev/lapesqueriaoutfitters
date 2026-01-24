import { Metadata } from 'next';
import Link from 'next/link';
import { Package, Truck, Users, Award, CheckCircle, ArrowRight, Store, Heart } from 'lucide-react';
import { FaireLogo } from '@/components/FaireLogo';

export const metadata: Metadata = {
  title: "Wholesale | La Pesqueria's Studio - Ocean-Themed Bracelets for Retailers",
  description: "Partner with La Pesqueria's Studio for wholesale ocean-inspired jewelry. Competitive wholesale pricing, low MOQs, and 10% of sales donated to marine conservation. Perfect for boutiques, gift shops, and retailers.",
  keywords: 'wholesale bracelets, wholesale jewelry, ocean jewelry wholesale, marine conservation products, boutique wholesale, handmade jewelry wholesale, eco-friendly wholesale',
};

export default function WholesalePage() {
  const wholesaleTiers = [
    {
      name: 'Starter',
      moq: '12 units',
      discount: '30% off retail',
      price: '$10.50/unit',
      features: [
        'Mix and match styles',
        'Standard shipping included',
        'Digital marketing assets',
        'Net 30 terms (approved accounts)',
      ],
      popular: false,
      color: 'from-cyan-500 to-teal-500',
    },
    {
      name: 'Standard',
      moq: '24 units',
      discount: '40% off retail',
      price: '$9.00/unit',
      features: [
        'All Starter benefits',
        'Priority fulfillment',
        'Exclusive seasonal designs',
        'Free display materials',
        'Dedicated account support',
      ],
      popular: true,
      color: 'from-teal-500 to-emerald-500',
    },
    {
      name: 'Premium',
      moq: '48+ units',
      discount: '50% off retail',
      price: '$7.50/unit',
      features: [
        'All Standard benefits',
        'Custom packaging options',
        'Early access to new collections',
        'Co-branded marketing support',
        'Quarterly product previews',
        'Volume rebates available',
      ],
      popular: false,
      color: 'from-purple-500 to-indigo-500',
    },
  ];

  const benefits = [
    {
      icon: Heart,
      title: 'Conservation Story',
      description: '10% of every sale supports marine conservation—a powerful story for your customers.',
    },
    {
      icon: Package,
      title: 'Low Minimums',
      description: 'Start with just 12 units. Perfect for boutiques testing new product lines.',
    },
    {
      icon: Truck,
      title: 'Fast Fulfillment',
      description: 'Orders ship within 3-5 business days from our South Padre Island studio.',
    },
    {
      icon: Award,
      title: 'Handcrafted Quality',
      description: 'Each bracelet is individually handmade with premium, eco-friendly materials.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-700 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Cpath fill=%22%23ffffff%22 d=%22M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z%22/%3E%3C/svg%3E')] bg-repeat" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Store className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Now available on Faire</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
              Wholesale Partnership
            </h1>
            <p className="text-xl text-cyan-100 max-w-3xl mx-auto mb-8 leading-relaxed">
              Bring ocean-inspired artisan jewelry to your boutique. Handcrafted bracelets with a 
              powerful conservation story that resonates with conscious consumers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://faire.com/brand/lapesqueriaoutfitters"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-teal-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-cyan-50 transition-all shadow-xl"
              >
                <FaireLogo />
                Shop on Faire
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#apply"
                className="inline-flex items-center gap-2 border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-teal-700 transition-all"
              >
                Apply Direct
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Why Partner With La Pesqueria&apos;s Studio?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-slate-50 hover:bg-teal-50 transition-colors">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{benefit.title}</h3>
                <p className="text-slate-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Wholesale Pricing
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Competitive margins designed for retail success. All prices based on $15 retail.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {wholesaleTiers.map((tier, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-3xl shadow-xl overflow-hidden ${
                  tier.popular ? 'ring-4 ring-teal-500 scale-105' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-center py-2 text-sm font-bold">
                    MOST POPULAR
                  </div>
                )}
                
                <div className={`p-8 ${tier.popular ? 'pt-14' : ''}`}>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{tier.name}</h3>
                  <div className="mb-4">
                    <span className={`text-4xl font-black bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                      {tier.price}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-6">
                    <span className="font-semibold">{tier.moq}</span> minimum • {tier.discount}
                  </p>
                  
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <a
                    href="#apply"
                    className={`block w-full text-center py-3 px-6 rounded-xl font-bold transition-all ${
                      tier.popular
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:shadow-lg'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Get Started
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section id="apply" className="py-20 bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Apply for Wholesale
            </h2>
            <p className="text-xl text-slate-300">
              Fill out the form below and we&apos;ll get back to you within 1-2 business days.
            </p>
          </div>

          <form className="bg-white rounded-2xl p-8 shadow-2xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="businessName" className="block text-sm font-semibold text-slate-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Your Store Name"
                />
              </div>
              <div>
                <label htmlFor="contactName" className="block text-sm font-semibold text-slate-700 mb-2">
                  Contact Name *
                </label>
                <input
                  type="text"
                  id="contactName"
                  name="contactName"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Your Name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="you@yourbusiness.com"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="(555) 555-5555"
                />
              </div>
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-semibold text-slate-700 mb-2">
                Website / Social Media
              </label>
              <input
                type="url"
                id="website"
                name="website"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="https://yourstore.com or @yourinsta"
              />
            </div>

            <div>
              <label htmlFor="businessType" className="block text-sm font-semibold text-slate-700 mb-2">
                Business Type *
              </label>
              <select
                id="businessType"
                name="businessType"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Select your business type</option>
                <option value="boutique">Boutique / Gift Shop</option>
                <option value="coastal">Beach / Coastal Store</option>
                <option value="spa">Spa / Wellness Center</option>
                <option value="eco">Eco-Friendly / Sustainable Store</option>
                <option value="resort">Resort / Hotel Gift Shop</option>
                <option value="online">Online Retailer</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">
                Tell us about your store
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="What products are you interested in? What&apos;s your estimated order volume?"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              Submit Application
            </button>

            <p className="text-center text-sm text-slate-500">
              Prefer Faire? <a href="https://faire.com/brand/lapesqueriaoutfitters" target="_blank" rel="noopener noreferrer" className="text-teal-600 font-semibold hover:underline">Shop on Faire</a> for easy ordering and free returns.
            </p>
          </form>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            {[
              {
                q: 'What are your minimum order quantities?',
                a: 'Our minimum order is 12 units, which you can mix and match across different styles and sizes.',
              },
              {
                q: 'Do you offer NET payment terms?',
                a: 'Yes! Approved accounts qualify for NET 30 terms. First orders are prepaid while we establish the relationship.',
              },
              {
                q: 'How long does shipping take?',
                a: 'Orders typically ship within 3-5 business days from our South Padre Island studio. We use USPS Priority for domestic orders.',
              },
              {
                q: 'Can I get custom packaging?',
                a: 'Premium tier partners (48+ units) have access to custom packaging options including branded tags and eco-friendly gift boxes.',
              },
              {
                q: 'What is your return policy for retailers?',
                a: 'We accept returns of undamaged, unopened merchandise within 30 days for store credit or exchange.',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-slate-50 rounded-xl p-6">
                <h3 className="font-bold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-teal-600 to-cyan-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Partner?
          </h2>
          <p className="text-xl text-cyan-100 mb-8">
            Join boutiques and retailers nationwide offering handcrafted, conservation-focused jewelry.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://faire.com/brand/lapesqueriaoutfitters"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-teal-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-cyan-50 transition-all shadow-xl"
            >
              Shop on Faire
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-teal-700 transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
