import Link from 'next/link'
import Image from 'next/image'
import { VCardQRCode } from '@/components/VCardQRCode'

export default function Footer() {
  return (
    <footer className="bg-[#001F3F] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand & Address */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Image
                src="/images/lapescerialogo.png"
                alt="La Pesqueria Outfitters"
                width={150}
                height={150}
                className="object-contain h-20 w-auto brightness-110"
              />
            </div>
            <p className="text-white/70 leading-relaxed">
              Premium fishing apparel and gear in McAllen, TX. High-performance T-shirts, hats, and coastal gear for the modern angler.
            </p>
            <div className="text-white/70 text-sm mt-4">
              <p className="font-bold text-white">La Pesqueria Outfitters</p>
              <p>4400 N 23rd St Suite 135</p>
              <p>McAllen, TX 78504</p>
              <p className="mt-2 text-[#FF4500]">McAllen, Texas</p>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-[#FF4500] uppercase">Shop</h3>
            <ul className="space-y-2 text-white/70">
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?category=tshirts" className="hover:text-white transition-colors">
                  T-Shirts
                </Link>
              </li>
              <li>
                <Link href="/products?category=hats" className="hover:text-white transition-colors">
                  Hats
                </Link>
              </li>
              <li>
                <Link href="/products?category=gear" className="hover:text-white transition-colors">
                  Gear
                </Link>
              </li>
              <li>
                <Link href="/products?category=accessories" className="hover:text-white transition-colors">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-[#FF4500] uppercase">Company</h3>
            <ul className="space-y-2 text-white/70">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Captain&apos;s Log
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/wholesale" className="hover:text-white transition-colors">
                  Wholesale
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-[#FF4500] uppercase">Support</h3>
            <ul className="space-y-2 text-white/70">
              <li>
                <Link href="/shipping" className="hover:text-white transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="hover:text-white transition-colors">
                  Size Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-[#FF4500] uppercase">Legal</h3>
            <ul className="space-y-2 text-white/70">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="hover:text-white transition-colors">
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="text-center">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#FF4500] mb-4 uppercase">Follow the Journey</h3>
              <div className="flex justify-center items-center gap-4 mb-6">
                <a
                  href="https://www.instagram.com/lapesqueria"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#FF4500] text-white px-6 py-3 rounded font-bold hover:bg-[#FF5722] transition-all transform shadow-lg uppercase"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  @lapesqueria
                </a>
              </div>
            </div>
            <div className="flex justify-center items-center gap-8 text-sm text-white/60">
              <span>UPF 50+ Protection</span>
              <span>|</span>
              <span>Moisture Wicking</span>
              <span>|</span>
              <span>Salt-Resistant</span>
            </div>
          </div>
        </div>

        {/* Web Development Partner */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="bg-white/5 rounded-lg p-6">
            <div className="text-center">
              <h3 className="text-lg font-bold text-[#FF4500] mb-2 uppercase">Website Developed By</h3>
              <a
                href="https://softwarepros.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xl font-bold text-white hover:text-[#FF4500] transition-colors mb-3"
              >
                SoftwarePros.org →
              </a>
              <p className="text-white/60 leading-relaxed max-w-3xl mx-auto">
                Expert team specializing in modern e-commerce websites, admin panels, and mobile applications.
                Visit them for all your web and mobile development needs!
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="max-w-4xl mx-auto text-center mb-6">
            <p className="text-white/60 text-sm leading-relaxed">
              <strong className="text-white">La Pesqueria Outfitters</strong> - Your source for
              <span className="text-white font-semibold"> premium fishing apparel in McAllen, TX</span>.
              High-performance T-shirts, hats, and coastal gear for serious anglers.
              Shop UPF 50+ protection clothing and moisture-wicking fishing shirts in the Rio Grande Valley.
            </p>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center text-white/50 text-sm gap-4">
            <p className="text-center md:text-left">
              © 2026 La Pesqueria Outfitters™. All Rights Reserved. <br className="md:hidden" />
              McAllen, Texas.
            </p>
            <div className="flex items-center gap-4">
              <span>Premium Fishing Apparel</span>
              <span>|</span>
              <span>Built for the Water</span>
            </div>
            <VCardQRCode size={100} />
          </div>
          <div className="mt-4 text-center text-xs text-white/40">
            <p>
              Fishing apparel McAllen TX, fishing shirts, UPF 50 clothing, performance fishing gear,
              moisture wicking shirts, salt resistant apparel, South Texas fishing, Rio Grande Valley
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
