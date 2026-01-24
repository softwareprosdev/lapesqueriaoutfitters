import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Package,
  Heart,
  Trophy,
  User,
  ShoppingBag,
  Gift,
  Home
} from 'lucide-react';
import LogoutButton from '@/components/customer/LogoutButton';

export default async function CustomerAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'CUSTOMER') {
    redirect('/login');
  }

  const navItems = [
    { href: '/account', label: 'Overview', icon: User },
    { href: '/account/orders', label: 'My Orders', icon: Package },
    { href: '/account/rewards', label: 'Rewards', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50">
      {/* Ocean-Themed Header */}
      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 text-white py-6 sm:py-12 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-3 mb-2 justify-center sm:justify-start">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <User className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h1 className="text-2xl sm:text-4xl font-bold">My Account</h1>
              </div>
              <p className="text-cyan-100 text-sm sm:text-lg">Welcome back, {session.user.name}!</p>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
              <Link href="/products">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold border-0 text-xs sm:text-sm"
                >
                  <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Shop
                </Button>
              </Link>
              <Link href="/">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold border-0 text-xs sm:text-sm"
                >
                  <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Home
                </Button>
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto py-2 sm:py-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors whitespace-nowrap min-w-fit"
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {children}
      </main>

      {/* Ocean Conservation Footer Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-cyan-700 to-blue-700 text-white mt-8 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col items-center text-center gap-4 sm:gap-6 md:flex-row md:text-left md:justify-between">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-white/20 rounded-full backdrop-blur-sm">
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold">Thank You for Supporting Ocean Conservation!</h3>
                <p className="text-cyan-100 text-xs sm:text-sm">
                  10% of every purchase protects sea turtles, whales, and marine ecosystems
                </p>
              </div>
            </div>
            <Link href="/conservation">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold border-0 text-xs sm:text-sm"
              >
                View Our Impact
                <Gift className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
