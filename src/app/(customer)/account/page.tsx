import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';

async function getCustomerData(userId: string) {
  const [user, orders, rewards] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    }),
    prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    }),
    prisma.customerReward.findUnique({
      where: { userId },
      include: {
        achievements: {
          include: {
            achievement: true,
          },
        },
        pointTransactions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
    }),
  ]);

  return { user, orders, rewards };
}

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'CUSTOMER') {
    redirect('/login');
  }

  const { user, orders, rewards } = await getCustomerData(session.user.id);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze': return 'bg-amber-900/50 text-amber-200 border-amber-800';
      case 'Silver': return 'bg-slate-700 text-slate-200 border-slate-600';
      case 'Gold': return 'bg-yellow-900/50 text-yellow-200 border-yellow-700';
      case 'Platinum': return 'bg-purple-900/50 text-purple-200 border-purple-800';
      default: return 'bg-slate-800 text-slate-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-900/30 text-yellow-400 border-yellow-800';
      case 'PROCESSING': return 'bg-blue-900/30 text-blue-400 border-blue-800';
      case 'SHIPPED': return 'bg-purple-900/30 text-purple-400 border-purple-800';
      case 'DELIVERED': return 'bg-green-900/30 text-green-400 border-green-800';
      case 'CANCELLED': return 'bg-red-900/30 text-red-400 border-red-800';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Welcome Section with Animation */}
        <div className="mb-4 sm:mb-8 group">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="space-y-1 sm:space-y-2">
              <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-slate-400 text-sm sm:text-lg">Here&apos;s your ocean conservation journey</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm text-slate-500">Member since {new Date(user?.createdAt || '').getFullYear()}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Rewards Card - Enhanced */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <div className="group bg-slate-900 rounded-xl sm:rounded-2xl shadow-xl border border-slate-800 p-4 sm:p-6 hover:shadow-2xl hover:shadow-cyan-900/20 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Your Rewards</h2>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-lg border ${getTierColor(rewards?.currentTier || 'Bronze')} animate-pulse`}>
                    {rewards?.currentTier || 'Bronze'}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="text-center p-6 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-2xl shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                    <div className="text-5xl font-black text-white drop-shadow-lg">{rewards?.points || 0}</div>
                    <div className="text-sm text-cyan-100 font-semibold mt-1">Reward Points</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 shadow-md hover:shadow-lg transition-all">
                      <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">{rewards?.totalOrders || 0}</div>
                      <div className="text-xs text-slate-400 font-medium mt-1">Orders</div>
                    </div>
                    <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 shadow-md hover:shadow-lg transition-all">
                      <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">${(rewards?.totalSpent || 0).toFixed(2)}</div>
                      <div className="text-xs text-slate-400 font-medium mt-1">Spent</div>
                    </div>
                  </div>

                  <Link
                    href="/account/rewards"
                    className="block w-full text-center bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-teal-500/50 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <span className="flex items-center justify-center gap-2">
                      View All Rewards
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Links - Enhanced */}
            <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 p-6 hover:shadow-xl transition-shadow">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                Quick Links
              </h2>
              <div className="space-y-2">
                {[
                  { href: '/account/orders', label: 'Order History', icon: '📦', color: 'text-blue-400' },
                  { href: '/account/rewards', label: 'Rewards & Achievements', icon: '🏆', color: 'text-amber-400' },
                  { href: '/products', label: 'Shop Products', icon: '🌊', color: 'text-teal-400' },
                  { href: '/conservation', label: 'Conservation Impact', icon: '🐢', color: 'text-green-400' },
                ].map((link, idx) => (
                  <Link
                    key={idx}
                    href={link.href}
                    className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all duration-200 border border-transparent hover:border-slate-700"
                  >
                    <span className="text-2xl group-hover:scale-125 transition-transform duration-200">{link.icon}</span>
                    <span className="text-slate-300 group-hover:text-white font-medium transition-colors">{link.label}</span>
                    <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-slate-500">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Orders - Enhanced */}
            <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-6 hover:shadow-2xl transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Recent Orders</h2>
                {orders.length > 0 && (
                  <Link
                    href="/account/orders"
                    className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group"
                  >
                    View All
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                )}
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-16">
                  <h3 className="text-xl font-bold text-white mb-2">No Orders Yet</h3>
                  <p className="text-slate-400 mb-6">Start your ocean conservation journey today!</p>
                  <Link
                    href="/products"
                    className="inline-block bg-teal-600 hover:bg-teal-500 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="group border border-slate-800 rounded-2xl p-5 hover:shadow-lg hover:border-slate-700 transition-all duration-300 bg-slate-800/50">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-bold text-white text-lg">#{order.orderNumber}</p>
                          <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                            📅 {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-md border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4 p-3 bg-slate-900 rounded-xl border border-slate-800">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-sm">
                            <span className="text-slate-300 font-medium">
                              {item.variant.product.name} <span className="text-slate-500">×{item.quantity}</span>
                            </span>
                            <span className="font-bold text-teal-400">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                        <div>
                          <span className="text-sm text-slate-500">Total</span>
                          <p className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">${order.total.toFixed(2)}</p>
                        </div>
                        <Link
                          href={`/account/orders/${order.id}`}
                          className="group/btn bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                        >
                          View Details
                          <span className="transform group-hover/btn:translate-x-1 transition-transform">→</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Points - Enhanced */}
            {rewards && rewards.pointTransactions.length > 0 && (
              <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-6 hover:shadow-2xl transition-shadow">
                <h2 className="text-2xl font-bold text-white mb-6">Recent Point Activity</h2>
                <div className="space-y-3">
                  {rewards.pointTransactions.map((transaction) => (
                    <div key={transaction.id} className="group flex justify-between items-center p-4 bg-slate-800 rounded-xl border border-slate-700 hover:shadow-md hover:border-slate-600 transition-all duration-200">
                      <div>
                        <p className="font-semibold text-white group-hover:text-cyan-400 transition-colors">{transaction.description}</p>
                        <p className="text-sm text-slate-500 mt-1">
                          📅 {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`text-2xl font-black px-4 py-2 rounded-xl ${
                        transaction.points > 0
                          ? 'bg-gradient-to-r from-emerald-900/50 to-green-900/50 text-emerald-400 border border-emerald-800 shadow-lg'
                          : 'bg-gradient-to-r from-red-900/50 to-rose-900/50 text-red-400 border border-red-800 shadow-lg'
                      }`}>
                        {transaction.points > 0 ? '+' : ''}{transaction.points}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}