'use client'

import { useState } from 'react'
import Image from 'next/image'
import AnimatedSection from '@/components/AnimatedSection'
import { Mail, Phone, MapPin, Clock, Anchor, Fish, Send } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <AnimatedSection animation="scaleIn" className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-10 text-center border border-gray-100">
            <div className="w-20 h-20 bg-[#FF4500]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Fish className="w-10 h-10 text-[#FF4500]" />
            </div>
            <h1 className="text-3xl font-black text-[#001F3F] mb-4 uppercase">Message Sent!</h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Your message has been received. We&apos;ll get back to you within 24 hours to help you find the perfect fishing gear for your next adventure.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
              }}
              className="w-full bg-[#001F3F] text-white font-bold py-4 rounded-xl hover:bg-[#002D5C] transition-all shadow-lg hover:scale-105 transform uppercase"
            >
              Send Another Message
            </button>
          </div>
        </AnimatedSection>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section with Fishing Background */}
      <section className="relative bg-[#001F3F] py-16 text-white text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1534590227743-096882d2d300?w=1920&q=80"
            alt="Fishing at sunrise"
            fill
            priority
            className="object-cover opacity-30"
            style={{ objectPosition: 'center center' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#001F3F]/80 via-[#001F3F]/60 to-[#001F3F]/90" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection animation="fadeInDown">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-[#FF4500] rounded-full flex items-center justify-center">
                <Anchor className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight uppercase">
              Contact La Pesqueria
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Got questions about our fishing gear or apparel? The crew at La Pesqueria Outfitters is here to help you gear up for your next big catch.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info Cards */}
            <div className="space-y-6">
              {/* Store Location */}
              <AnimatedSection animation="fadeInUp" delay={100}>
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#FF4500] hover:shadow-xl transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#001F3F] rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#001F3F] mb-2 uppercase">Visit Our Store</h3>
                      <p className="text-gray-800 font-semibold">La Pesqueria Outfitters</p>
                      <p className="text-gray-600 text-sm mt-1">4400 N 23rd St Suite 135</p>
                      <p className="text-gray-600 text-sm">McAllen, TX 78504</p>
                      <p className="text-[#FF4500] text-sm font-medium mt-2">McAllen, Texas</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* Contact Methods */}
              <AnimatedSection animation="fadeInUp" delay={200}>
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#001F3F] hover:shadow-xl transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#FF4500]/10 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-[#FF4500]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Email Us</p>
                        <a href="mailto:info@lapesqueria.com" className="text-[#001F3F] font-semibold hover:text-[#FF4500] transition-colors">
                          info@lapesqueria.com
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#FF4500]/10 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-[#FF4500]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Call Us</p>
                        <a href="tel:+19565550123" className="text-[#001F3F] font-semibold hover:text-[#FF4500] transition-colors">
                          (956) 555-0123
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* Store Hours */}
              <AnimatedSection animation="fadeInUp" delay={300}>
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#FF4500] hover:shadow-xl transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#001F3F] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#001F3F] mb-3 uppercase">Store Hours</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monday - Friday</span>
                          <span className="text-[#001F3F] font-medium">9:00 AM - 6:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Saturday</span>
                          <span className="text-[#001F3F] font-medium">9:00 AM - 5:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sunday</span>
                          <span className="text-gray-400">Closed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* Why Contact Us */}
              <AnimatedSection animation="fadeInUp" delay={400}>
                <div className="bg-[#001F3F] rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <Fish className="w-6 h-6 text-[#FF4500]" />
                    <h3 className="text-lg font-bold uppercase">Why Reach Out?</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-white/80">
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF4500] mt-1">›</span>
                      <span>Questions about sizing and fit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF4500] mt-1">›</span>
                      <span>Custom orders for teams or events</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF4500] mt-1">›</span>
                      <span>Wholesale inquiries</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF4500] mt-1">›</span>
                      <span>Product recommendations</span>
                    </li>
                  </ul>
                </div>
              </AnimatedSection>
            </div>

            {/* Contact Form */}
            <AnimatedSection animation="fadeInRight" delay={200} className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-8 md:p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <Send className="w-6 h-6 text-[#FF4500]" />
                    <h2 className="text-2xl font-bold text-[#001F3F] uppercase">Send Us a Message</h2>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF4500] focus:border-[#FF4500] outline-none transition-all"
                          placeholder="Your Name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF4500] focus:border-[#FF4500] outline-none transition-all"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF4500] focus:border-[#FF4500] outline-none transition-all"
                          placeholder="(optional)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Subject</label>
                        <select
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF4500] focus:border-[#FF4500] outline-none transition-all"
                        >
                          <option value="">Select a topic</option>
                          <option value="general">General Inquiry</option>
                          <option value="sizing">Sizing & Fit</option>
                          <option value="custom">Custom Orders</option>
                          <option value="wholesale">Wholesale</option>
                          <option value="order">Order Status</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Message</label>
                      <textarea
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF4500] focus:border-[#FF4500] outline-none transition-all resize-none"
                        placeholder="Tell us how we can help you..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#001F3F] text-white font-bold py-4 rounded-lg hover:bg-[#002D5C] transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-wide"
                    >
                      <Send className="w-5 h-5" />
                      <span>Send Message</span>
                    </button>
                  </form>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="bg-[#001F3F] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 uppercase tracking-tight">
              Find Us on the Water
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Located in the heart of South Texas fishing country. Stop by and see our full selection of fishing apparel and gear.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="aspect-video relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3578.123456789!2d-98.2461!3d26.2466!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x866f9c4a12345678%3A0x1234567890abcdef!2s4400%20N%2023rd%20St%20%23135%2C%20McAllen%2C%20TX%2078504!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="La Pesqueria Outfitters Location"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
