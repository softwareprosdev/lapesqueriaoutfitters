'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Users,
  Ticket,
  MessageSquare,
  Mail,
  CreditCard,
  BarChart3,
  Heart,
  Settings,
  Menu,
  X,
  Calendar,
  FileText,
  Sparkles,
  RotateCcw,
  Truck,
  UserCog,
  TrendingUp,
  Send,
  ShoppingBag,
  Search,
  LineChart,
  Headphones,
  Repeat,
  Ruler,
  Megaphone,
  Shirt,
  Anchor,
  Fish,
  Ship,
} from 'lucide-react';

interface AdminSidebarProps {
  userName?: string | null;
}

export function AdminSidebar({}: AdminSidebarProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navSections = [
    {
      title: 'Overview',
      items: [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, color: 'from-[#FF4500] to-orange-400' },
        { href: '/admin/analytics', label: 'Analytics', icon: TrendingUp, color: 'from-emerald-500 to-teal-400' },
        { href: '/admin/reports', label: 'Reports', icon: BarChart3, color: 'from-violet-500 to-purple-400' },
        { href: '/admin/calendar', label: 'Calendar', icon: Calendar, color: 'from-pink-500 to-rose-400' },
      ]
    },
    {
      title: 'Catalog',
      items: [
        { href: '/admin/products', label: 'Products', icon: Package, color: 'from-[#001F3F] to-blue-400' },
        { href: '/admin/inventory', label: 'Inventory', icon: Boxes, color: 'from-amber-500 to-orange-400' },
        { href: '/admin/inventory/tshirts', label: 'T-Shirts', icon: Shirt, color: 'from-purple-500 to-pink-400' },
        { href: '/admin/inventory-forecast', label: 'Forecasting', icon: LineChart, color: 'from-cyan-500 to-blue-400' },
        { href: '/admin/categories', label: 'Categories', icon: Boxes, color: 'from-lime-500 to-green-400' },
      ]
    },
    {
      title: 'Sales',
      items: [
        { href: '/admin/orders', label: 'Orders', icon: ShoppingCart, color: 'from-[#001F3F] to-cyan-400' },
        { href: '/admin/customers', label: 'Customers', icon: Users, color: 'from-teal-500 to-cyan-400' },
        { href: '/admin/abandoned-carts', label: 'Abandoned Carts', icon: ShoppingBag, color: 'from-orange-500 to-amber-400' },
        { href: '/admin/payments', label: 'Payments', icon: CreditCard, color: 'from-indigo-500 to-blue-400' },
        { href: '/admin/discounts', label: 'Discounts', icon: Ticket, color: 'from-fuchsia-500 to-pink-400' },
        { href: '/admin/returns', label: 'Returns', icon: RotateCcw, color: 'from-orange-500 to-red-400' },
        { href: '/admin/shipping', label: 'Shipping & Labels', icon: Truck, color: 'from-indigo-500 to-violet-400' },
      ]
    },
    {
      title: 'Marketing',
      items: [
        { href: '/admin/marketing', label: 'Marketing Hub', icon: Megaphone, color: 'from-purple-500 to-pink-400' },
        { href: '/admin/email-campaigns', label: 'Campaigns', icon: Send, color: 'from-rose-500 to-pink-400' },
        { href: '/admin/seo', label: 'SEO', icon: Search, color: 'from-green-500 to-emerald-400' },
        { href: '/admin/blog', label: 'Blog Posts', icon: FileText, color: 'from-purple-500 to-pink-400' },
        { href: '/admin/reviews', label: 'Reviews', icon: MessageSquare, color: 'from-sky-500 to-blue-400' },
        { href: '/admin/email', label: 'Email Client', icon: Mail, color: 'from-cyan-500 to-teal-400' },
        { href: '/admin/email-logs', label: 'Email Logs', icon: Mail, color: 'from-slate-500 to-gray-400' },
      ]
    },
    {
      title: 'Intelligence',
      items: [
        { href: '/admin/ai-features', label: 'AI Tools', icon: Sparkles, color: 'from-amber-500 to-yellow-400' },
      ]
    },
    {
      title: 'Support',
      items: [
        { href: '/admin/support-tickets', label: 'Tickets', icon: Headphones, color: 'from-indigo-500 to-purple-400' },
      ]
    },
    {
      title: 'System',
      items: [
        { href: '/admin/staff', label: 'Staff', icon: UserCog, color: 'from-blue-500 to-indigo-400' },
        { href: '/admin/apparel-sizes', label: 'Apparel Sizes', icon: Ruler, color: 'from-amber-500 to-orange-400' },
        { href: '/admin/data-cleanup', label: 'Data Cleanup', icon: Ship, color: 'from-red-500 to-orange-400' },
        { href: '/admin/settings', label: 'Settings', icon: Settings, color: 'from-slate-500 to-gray-400' },
      ]
    }
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-[#001F3F]/90 backdrop-blur-md text-white shadow-lg border border-white/10 active:scale-95 transition-transform"
      >
        <Menu className="h-6 w-6" />
      </button>

      <aside className={`fixed left-0 top-0 z-40 h-screen w-72 transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-full flex-col bg-[#001F3F] border-r border-white/10 pt-safe-top pb-safe-bottom">
          <div className="flex h-16 items-center justify-between px-6 border-b border-white/10">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="relative h-10 w-10 rounded-xl bg-[#FF4500]/10 flex items-center justify-center border border-[#FF4500]/20">
                <Anchor className="h-5 w-5 text-[#FF4500]" />
              </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">La Pesqueria</span>
                  <span className="text-[10px] text-white/60 uppercase tracking-wider">Outfitters Admin</span>
                </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-hide">
            {navSections.map((section) => (
              <div key={section.title}>
                <h3 className="px-3 mb-3 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                          active
                            ? 'text-white'
                            : 'text-white/60 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {active && (
                          <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.color} opacity-10`} />
                        )}
                        <div className="relative z-10 flex items-center gap-3">
                          <Icon className={cn("h-5 w-5 transition-transform", active ? "text-[#FF4500]" : "group-hover:scale-110")} />
                          <span>{item.label}</span>
                        </div>
                        {active && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF4500] shadow-[0_0_8px_rgba(255,69,0,0.6)]" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#FF4500]/5 border border-[#FF4500]/10">
              <div className="relative">
                <Fish className="h-5 w-5 text-[#FF4500]" />
                <div className="absolute inset-0 h-5 w-5 text-[#FF4500] animate-ping opacity-20" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white uppercase tracking-tight">La Pesqueria</p>
                <p className="text-[10px] text-[#FF4500]/80 font-medium">Outfitters</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}
    </>
  );
}
