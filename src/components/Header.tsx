'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useCart } from '@/context/CartContext'
import SearchBar from '@/components/SearchBar'
import MiniCart from '@/components/MiniCart'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { LanguageSelector } from '@/components/LanguageSelector'
import { SocialMediaButtons } from '@/components/SocialMediaButtons'

interface SiteSettings {
  siteName: string;
  logo: string | null;
}

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { state: cart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMiniCart, setShowMiniCart] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: "La Pesqueria Outfitters",
    logo: '/images/lapescerialogo.png',
  });

  useEffect(() => {
    // Fetch site settings
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.logo) {
          setSettings({
            siteName: data.siteName || "La Pesqueria Outfitters",
            logo: data.logo,
          });
        }
        // Keep default logo if API doesn't provide one
      })
      .catch(err => {
        console.error('Failed to load site settings, using default logo:', err);
        // Keep the default logo on error
      });
  }, []);

  // Close mobile menu when clicking a link
  const closeMobileMenu = () => {
    setIsMenuOpen(false);
  };

  // Mega menu component - compact dropdown
  const MegaMenu = ({ isOpen }: { isOpen: boolean }) => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="absolute top-full left-0 min-w-[280px] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
        >
          <div className="py-2">
            {productCategories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03, duration: 0.15 }}
              >
                <Link
                  href={category.href}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-teal-50 transition-colors group"
                  onClick={() => setIsMegaMenuOpen(false)}
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">
                    {category.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 group-hover:text-teal-600 transition-colors text-sm">
                      {category.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {category.description}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products', hasMegaMenu: true },
    { name: 'Blog', href: '/blog' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const productCategories = [
    { name: 'All Products', href: '/products', icon: '🎣', description: 'Browse our complete collection' },
    { name: 'T-Shirts', href: '/tshirts', icon: '👕', description: 'Performance fishing shirts' },
    { name: 'Performance', href: '/products?category=performance-shirts', icon: '🏃', description: 'High-performance apparel' },
    { name: 'Hats', href: '/products?category=hats', icon: '🧢', description: 'Sun protection and style' },
    { name: 'Hoodies', href: '/products?category=hoodies', icon: '🧥', description: 'Comfortable fishing hoodies' },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        <div className="flex justify-between items-center h-28">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-[#001F3F] flex items-center gap-2 hover:text-orange-500 transition-colors">
              {settings.logo ? (
                <Image
                  src={settings.logo}
                  alt={settings.siteName}
                  width={400}
                  height={400}
                  className="object-contain h-24 w-auto"
                  priority
                />
              ) : (
                <>
                  <span className="text-3xl">🌊</span>
                  <span className="hidden sm:inline">{settings.siteName}</span>
                </>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-5 lg:space-x-7 xl:space-x-10">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="relative"
                onMouseEnter={() => link.hasMegaMenu && setIsMegaMenuOpen(true)}
                onMouseLeave={() => link.hasMegaMenu && setIsMegaMenuOpen(false)}
              >
                <Link
                  href={link.hasMegaMenu ? '/products' : link.href}
                  className={cn(
                    "relative py-2 text-gray-700 hover:text-teal-600 transition-colors font-semibold tracking-wide group cursor-pointer flex items-center gap-1",
                    pathname === link.href && "text-teal-600"
                  )}
                  onClick={(e) => {
                    if (link.hasMegaMenu) {
                      // Allow navigation on click, but toggle menu on touch devices
                      if ('ontouchstart' in window) {
                        e.preventDefault();
                        setIsMegaMenuOpen(!isMegaMenuOpen);
                      }
                    }
                  }}
                >
                  {link.name}
                  {link.hasMegaMenu && (
                    <motion.span
                      animate={{ rotate: isMegaMenuOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-[10px] opacity-60"
                    >
                      ▼
                    </motion.span>
                  )}
                  {pathname === link.href && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"
                    />
                  )}
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                </Link>
                {link.hasMegaMenu && <MegaMenu isOpen={isMegaMenuOpen} />}
              </div>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            {/* Search Bar */}
            <SearchBar />

            {/* Social Media Share Buttons */}
            <SocialMediaButtons />

            {/* Cart with MiniCart on hover */}
            <div
              className="relative"
              onMouseEnter={() => setShowMiniCart(true)}
              onMouseLeave={() => setShowMiniCart(false)}
            >
              <Link href="/cart" className="text-gray-700 hover:text-teal-600 transition-colors relative block p-2">
                <ShoppingCart className="w-6 h-6" />
                {cart.items.length > 0 && (
                  <span className="absolute top-0 right-0 bg-teal-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.items.length}
                  </span>
                )}
              </Link>
              {showMiniCart && cart.items.length > 0 && <MiniCart />}
            </div>

            {/* User Actions */}
            {session && session.user.role === 'CUSTOMER' ? (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/account"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold text-sm block"
                >
                  My Account
                </Link>
              </motion.div>
            ) : session && session.user.role === 'ADMIN' ? (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/admin"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold text-sm block"
                >
                  Admin
                </Link>
              </motion.div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-teal-600 hover:text-teal-700 font-semibold text-sm"
                >
                  Sign In
                </Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/register"
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold text-sm block"
                  >
                    Register
                  </Link>
                </motion.div>
              </div>
            )}

            {/* Language Selector - Far Right */}
            <LanguageSelector />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-3">
            {/* Mobile Cart Icon */}
            <Link href="/cart" className="text-gray-700 hover:text-teal-600 transition-colors relative">
              <ShoppingCart className="w-6 h-6" />
              {cart.items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-teal-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.items.length}
                </span>
              )}
            </Link>

            {/* Hamburger Menu */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-teal-600 focus:outline-none p-2"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-teal-100/50 overflow-hidden bg-gradient-to-b from-white/95 to-cyan-50/95"
            >
              <nav className="py-4 space-y-1">
                {navLinks.map((link) => (
                  <div key={link.name}>
                    {link.hasMegaMenu ? (
                      <div>
                        <button
                          onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                          className="w-full flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors font-medium rounded"
                        >
                          <span>{link.name}</span>
                          <motion.span
                            animate={{ rotate: mobileProductsOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-lg"
                          >
                            ▼
                          </motion.span>
                        </button>
                        <AnimatePresence>
                          {mobileProductsOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="ml-4 mt-2 space-y-2"
                            >
                              {productCategories.map((category, index) => (
                                <motion.div
                                  key={category.name}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1, duration: 0.2 }}
                                >
                                  <Link
                                    href={category.href}
                                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-teal-50 hover:text-teal-600 transition-colors rounded-lg border-l-2 border-transparent hover:border-teal-300"
                                    onClick={closeMobileMenu}
                                  >
                                    <span className="text-xl">{category.icon}</span>
                                    <div>
                                      <div className="font-medium">{category.name}</div>
                                      <div className="text-xs text-gray-500">{category.description}</div>
                                    </div>
                                  </Link>
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href={link.href}
                        className={cn(
                          "block px-4 py-2 text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors font-medium rounded",
                          pathname === link.href && "text-teal-600 bg-teal-50"
                        )}
                        onClick={closeMobileMenu}
                      >
                        {link.name}
                      </Link>
                    )}
                  </div>
                ))}
                <Link
                  href="/cart"
                  className="block px-4 py-2 text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors font-medium rounded"
                  onClick={closeMobileMenu}
                >
                  Cart {cart.items.length > 0 && `(${cart.items.length})`}
                </Link>

                {/* Mobile Language Selector */}
                <div className="pt-2 px-4">
                  <LanguageSelector />
                </div>

                {/* Mobile User Actions */}
                <div className="pt-4 px-4 space-y-2 border-t border-teal-100/50 mt-4">
                  {session && session.user.role === 'CUSTOMER' ? (
                    <Link
                      href="/account"
                      className="block w-full text-center bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg transition-colors font-semibold"
                      onClick={closeMobileMenu}
                    >
                      My Account
                    </Link>
                  ) : session && session.user.role === 'ADMIN' ? (
                    <Link
                      href="/admin"
                      className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-colors font-semibold"
                      onClick={closeMobileMenu}
                    >
                      Admin Panel
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="block w-full text-center border-2 border-teal-600 text-teal-600 hover:bg-teal-50 px-4 py-3 rounded-lg transition-colors font-semibold"
                        onClick={closeMobileMenu}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/register"
                        className="block w-full text-center bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg transition-colors font-semibold"
                        onClick={closeMobileMenu}
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
