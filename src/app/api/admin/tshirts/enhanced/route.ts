import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '90';

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(range));

    // Get all t-shirt products
    const tshirtProducts = await prisma.product.findMany({
      where: {
        name: { contains: 't-shirt', mode: 'insensitive' }
      },
      include: {
        variants: true
      }
    });

    // If no t-shirts in database, return comprehensive mock data for demo
    if (tshirtProducts.length === 0) {
      const mockTshirts = getMockTshirtData();
      return NextResponse.json({
        tshirts: mockTshirts,
        summary: {
          totalTshirts: mockTshirts.length,
          totalStock: mockTshirts.reduce((sum, t) => sum + t.analytics.totalStock, 0),
          totalValue: mockTshirts.reduce((sum, t) => sum + t.analytics.totalValue, 0),
          avgPricePerShirt: mockTshirts.reduce((sum, t) => sum + t.analytics.avgPrice, 0) / mockTshirts.length
        },
        _isMockData: true
      });
    }

    // Enhanced t-shirt data with analytics
    const tshirtsWithAnalytics = await Promise.all(
      tshirtProducts.map(async (product) => {
        const variants = product.variants.map((variant): {
          id: string;
          size: string;
          color: string;
          stock: number;
          price: number;
          sales30Days: number;
          sales90Days: number;
          profitMargin: number;
          reorderPoint: number;
          safetyStock: number;
          supplier: string;
          lastRestock: string;
        } => {
          // Calculate sales data (simplified for demo)
          const sales30Days = Math.floor(Math.random() * 50);
          const sales90Days = sales30Days * 3;
          const profitMargin = 15 + Math.floor(Math.random() * 35);
          const reorderPoint = Math.max(5, sales30Days * 7);
          const safetyStock = Math.ceil(reorderPoint * 0.2);
          
          return {
            id: variant.id,
            size: variant.size || 'M',
            color: variant.color || 'White',
            stock: variant.stock,
            price: variant.price,
            sales30Days,
            sales90Days,
            profitMargin,
            reorderPoint,
            safetyStock,
            supplier: 'Premium Apparel Co.',
            lastRestock: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          };
        });

        const totalStock = variants.reduce((sum: number, v) => sum + v.stock, 0);
        const totalValue = variants.reduce((sum: number, v) => sum + v.price * v.stock, 0);
        const avgPrice = variants.length > 0 ? totalValue / totalStock : 0;

        // Analytics calculations
        const topSizes: Array<{ size: string; count: number; percentage: number }> = [];
        const topColors: Array<{ color: string; count: number; percentage: number }> = [];

        variants.forEach((variant) => {
          const existingSize = topSizes.find(item => item.size === variant.size);
          if (existingSize) {
            existingSize.count += 1;
          } else {
            topSizes.push({ size: variant.size, count: 1, percentage: 0 });
          }

          const existingColor = topColors.find(item => item.color === variant.color);
          if (existingColor) {
            existingColor.count += 1;
          } else {
            topColors.push({ color: variant.color, count: 1, percentage: 0 });
          }
        });

        // Calculate percentages
        topSizes.forEach((item) => {
          item.percentage = Math.round((item.count / variants.length) * 100);
        });
        topColors.forEach((item) => {
          item.percentage = Math.round((item.count / variants.length) * 100);
        });

        // Sort by count
        topSizes.sort((a, b) => b.count - a.count);
        topColors.sort((a, b) => b.count - a.count);

        // Monthly trend (mock data)
        const monthlyTrend: Array<{ month: string; sales: number; revenue: number }> = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const baseSales = Math.floor(Math.random() * 100) + 50;
          const seasonalMultiplier = getCurrentSeasonalMultiplier(date.getMonth());
          
          return {
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            sales: Math.floor(baseSales * seasonalMultiplier),
            revenue: Math.floor(baseSales * seasonalMultiplier * avgPrice)
          };
        });

        // Season performance
        const seasonPerformance: Record<string, { sales: number; revenue: number }> = {
          'Spring': { sales: 120, revenue: 2400 },
          'Summer': { sales: 180, revenue: 3600 },
          'Fall': { sales: 90, revenue: 1800 },
          'Winter': { sales: 60, revenue: 1200 }
        };

        // Size ratio (industry standard)
        const sizeRatio: Record<string, number> = {
          'XS': 5,
          'S': 15,
          'M': 30,
          'L': 25,
          'XL': 15,
          'XXL': 7,
          '3XL': 2,
          '4XL': 1
        };

        const recommendedRatio: Record<string, number> = {};
        const totalSizes = topSizes.reduce((sum: number, item) => sum + item.count, 0);
        topSizes.forEach((item) => {
          recommendedRatio[item.size] = Math.round((item.count / totalSizes) * 100);
        });

        return {
          productName: product.name,
          productId: product.id,
          variants,
          analytics: {
            totalStock,
            totalValue,
            avgPrice,
            topSizes: topSizes.slice(0, 5),
            topColors: topColors.slice(0, 5),
            monthlyTrend,
            seasonPerformance,
            sizeRatio,
            recommendedRatio
          }
        };
      })
    );

    return NextResponse.json({
      tshirts: tshirtsWithAnalytics,
      summary: {
        totalTshirts: tshirtsWithAnalytics.length,
        totalStock: tshirtsWithAnalytics.reduce((sum, t) => sum + t.analytics.totalStock, 0),
        totalValue: tshirtsWithAnalytics.reduce((sum, t) => sum + t.analytics.totalValue, 0),
        avgPricePerShirt: tshirtsWithAnalytics.reduce((sum, t) => sum + t.analytics.avgPrice, 0) / tshirtsWithAnalytics.length
      }
    });

  } catch (error) {
    console.error('Enhanced t-shirt fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch t-shirt data' },
      { status: 500 }
    );
  }
}

function getCurrentSeasonalMultiplier(month: number): number {
  // Spring (Mar-May): 1.1x, Summer (Jun-Aug): 1.3x, Fall (Sep-Nov): 0.9x, Winter (Dec-Feb): 0.7x
  if (month >= 2 && month <= 4) return 1.1; // Spring
  if (month >= 5 && month <= 7) return 1.3; // Summer
  if (month >= 8 && month <= 10) return 0.9; // Fall
  return 0.7; // Winter
}