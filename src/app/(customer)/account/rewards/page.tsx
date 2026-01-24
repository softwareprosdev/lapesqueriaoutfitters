import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';

async function getRewardsData(userId: string) {
  const rewards = await prisma.customerReward.findUnique({
    where: { userId },
    include: {
      achievements: {
        include: {
          achievement: true,
        },
        orderBy: {
          earnedAt: 'desc',
        },
      },
      pointTransactions: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  const availablePrizes = await prisma.rewardPrize.findMany({
    where: { isActive: true },
    orderBy: { pointsCost: 'asc' },
  });

  return { rewards, availablePrizes };
}

export default async function RewardsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'CUSTOMER') {
    redirect('/login');
  }

  const { rewards, availablePrizes } = await getRewardsData(session.user.id);

  const tierProgress = {
    Bronze: { min: 0, max: 500, next: 'Silver' },
    Silver: { min: 500, max: 1500, next: 'Gold' },
    Gold: { min: 1500, max: 3000, next: 'Platinum' },
    Platinum: { min: 3000, max: Infinity, next: null },
  };

  const currentTier = rewards?.currentTier || 'Bronze';
  const progress = tierProgress[currentTier as keyof typeof tierProgress];
  const pointsToNext = progress.next ? progress.max - (rewards?.points || 0) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/account" className="text-cyan-100 hover:text-white mb-2 inline-block">
            ← Back to Account
          </Link>
          <h1 className="text-3xl font-bold">Rewards & Achievements</h1>
          <p className="text-cyan-100 mt-1">Earn points, unlock badges, win prizes!</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Points & Tier Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-teal-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
            <div className="text-sm opacity-90 mb-1">Your Points</div>
            <div className="text-5xl font-bold">{rewards?.points || 0}</div>
            <div className="text-sm opacity-90 mt-2">Available to redeem</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Current Tier</div>
            <div className="text-3xl font-bold text-teal-600 mb-2">{currentTier}</div>
            {progress.next && (
              <div className="text-sm text-gray-600">
                {pointsToNext} points to {progress.next}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Achievements</div>
            <div className="text-3xl font-bold text-purple-600">
              {rewards?.achievements.length || 0}
            </div>
            <div className="text-sm text-gray-600">Badges earned</div>
          </div>
        </div>

        {/* How to Earn Points */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <span>🎮</span>
            How to Earn Points
          </h2>

          {/* Main Earning Method - Highlighted */}
          <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border-2 border-green-300">
            <div className="flex items-center gap-4">
              <div className="text-6xl">🛍️</div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-green-900 mb-1">Make a Purchase</div>
                <div className="text-lg font-semibold text-green-700">Earn 4 Points Per Purchase </div>
                <div className="text-sm text-green-600 mt-2">
                  Every order earns you points • 10 purchases = 40 points = 1 FREE item!
                </div>
              </div>
            </div>
          </div>

          {/* Redemption Info - Highlighted */}
          <div className="mb-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-300">
            <div className="flex items-center gap-4">
              <div className="text-6xl">🎁</div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-orange-900 mb-1">Redeem Your Points</div>
                <div className="text-lg font-semibold text-orange-700">40 Points = 1 Free Bracelet + FREE Shipping!</div>
                <div className="text-sm text-orange-600 mt-2">
                  Choose any item from our collection when you reach 40 points
                </div>
              </div>
            </div>
          </div>

          {/* Additional Ways to Earn */}
          <div className="mb-2 text-sm font-semibold text-gray-700">Bonus Points:</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-3xl mb-2">🎂</div>
              <div className="font-semibold text-blue-900">Birthday Bonus</div>
              <div className="text-sm text-blue-700">100 points on your birthday!</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-3xl mb-2">👥</div>
              <div className="font-semibold text-purple-900">Refer a Friend</div>
              <div className="text-sm text-purple-700">50 points per referral</div>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
              <div className="text-3xl mb-2">🏆</div>
              <div className="font-semibold text-pink-900">Unlock Achievements</div>
              <div className="text-sm text-pink-700">Bonus points for milestones</div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        {rewards?.achievements && rewards.achievements.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Your Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.achievements.map(({ achievement, earnedAt }) => (
                <div key={achievement.id} className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <div className="font-semibold text-gray-900">{achievement.name}</div>
                  <div className="text-sm text-gray-600 mb-2">{achievement.description}</div>
                  <div className="text-xs text-purple-600">
                    Earned {new Date(earnedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Prizes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Redeem Your Points</h2>

          {availablePrizes.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <div className="text-5xl mb-3">🎁</div>
              <p>No prizes available at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availablePrizes.map((prize) => {
                const canAfford = (rewards?.points || 0) >= prize.pointsCost;
                return (
                  <div key={prize.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    {prize.image && (
                      <div className="h-48 bg-gradient-to-br from-teal-100 to-blue-100"></div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{prize.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{prize.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-teal-600">{prize.pointsCost} pts</span>
                        <button
                          disabled={!canAfford}
                          className={`px-4 py-2 rounded-lg font-semibold ${
                            canAfford
                              ? 'bg-teal-600 hover:bg-teal-700 text-white'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          Redeem
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Point History */}
        {rewards?.pointTransactions && rewards.pointTransactions.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Point History</h2>
            <div className="space-y-2">
              {rewards.pointTransactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(transaction.createdAt).toLocaleDateString()} • {transaction.type}
                    </p>
                  </div>
                  <span className={`text-lg font-bold ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.points > 0 ? '+' : ''}{transaction.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
