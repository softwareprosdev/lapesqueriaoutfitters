import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface MonthlyData {
  month: string;
  revenue: number;
  orders: number;
  cogs: number;
  grossProfit: number;
  expenses: number;
  netIncome: number;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const quarter = searchParams.get('quarter'); // Q1, Q2, Q3, Q4, or null for full year

    // Calculate date range
    let startDate: Date;
    let endDate: Date;

    if (quarter) {
      const q = parseInt(quarter.replace('Q', ''));
      startDate = new Date(year, (q - 1) * 3, 1);
      endDate = new Date(year, q * 3, 0, 23, 59, 59, 999);
    } else {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    }

    // Fetch all orders in the date range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          notIn: ['CANCELLED'],
        },
      },
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
        conservationDonation: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Fetch returns for the period
    const returns = await prisma.return.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: 'REFUNDED',
      },
    });

    // Fetch shipping costs (from orders)
    const shippingLabels = await prisma.shippingLabel.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Calculate totals
    const grossRevenue = orders.reduce((sum, o) => sum + o.subtotal, 0);
    const shippingCollected = orders.reduce((sum, o) => sum + o.shipping, 0);
    const taxCollected = orders.reduce((sum, o) => sum + o.tax, 0);
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalRefunds = returns.reduce((sum, r) => sum + (r.refundAmount || 0), 0);
    const netRevenue = totalRevenue - totalRefunds;

    // Conservation donations (charitable contributions)
    const conservationDonations = orders.reduce(
      (sum, o) => sum + (o.conservationDonation?.amount || 0),
      0
    );

    // Estimate COGS (Cost of Goods Sold) - typically 30-40% for handmade jewelry
    // This is an estimate - actual COGS should be tracked per product
    const estimatedCOGS = grossRevenue * 0.35;

    // Shipping expenses paid (labels)
    const shippingExpenses = shippingLabels.reduce((sum, l) => sum + (l.cost || 0), 0);

    // Calculate gross profit
    const grossProfit = grossRevenue - estimatedCOGS;

    // Operating expenses (estimates based on typical e-commerce)
    // In a real system, these would come from expense tracking
    const operatingExpenses = {
      shipping: shippingExpenses || grossRevenue * 0.08, // Shipping costs
      paymentProcessing: totalRevenue * 0.029 + orders.length * 0.30, // Stripe fees ~2.9% + $0.30
      platformFees: totalRevenue * 0.02, // Hosting, software subscriptions ~2%
      packaging: grossRevenue * 0.05, // Packaging materials ~5%
      marketing: grossRevenue * 0.10, // Marketing/advertising ~10%
      conservation: conservationDonations, // Conservation donations
    };

    const totalOperatingExpenses = Object.values(operatingExpenses).reduce((a, b) => a + b, 0);

    // Net income before taxes
    const operatingIncome = grossProfit - totalOperatingExpenses;

    // Estimated self-employment tax (15.3%) and income tax bracket (assume 22%)
    const estimatedSETax = Math.max(0, operatingIncome * 0.153 * 0.9235); // 92.35% of net SE income
    const estimatedIncomeTax = Math.max(0, (operatingIncome - estimatedSETax / 2) * 0.22);
    const netIncomeAfterTax = operatingIncome - estimatedSETax - estimatedIncomeTax;

    // Monthly breakdown
    const monthlyData: MonthlyData[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let month = 0; month < 12; month++) {
      if (quarter) {
        const q = parseInt(quarter.replace('Q', ''));
        if (month < (q - 1) * 3 || month >= q * 3) continue;
      }

      const monthOrders = orders.filter((o) => {
        const orderMonth = new Date(o.createdAt).getMonth();
        return orderMonth === month;
      });

      const monthRevenue = monthOrders.reduce((sum, o) => sum + o.subtotal, 0);
      const monthCOGS = monthRevenue * 0.35;
      const monthGrossProfit = monthRevenue - monthCOGS;
      const monthExpenses = monthRevenue * 0.25; // ~25% operating expenses
      const monthNetIncome = monthGrossProfit - monthExpenses;

      monthlyData.push({
        month: monthNames[month],
        revenue: monthRevenue,
        orders: monthOrders.length,
        cogs: monthCOGS,
        grossProfit: monthGrossProfit,
        expenses: monthExpenses,
        netIncome: monthNetIncome,
      });
    }

    // Quarterly totals
    const quarterlyData = [
      { quarter: 'Q1', months: [0, 1, 2] },
      { quarter: 'Q2', months: [3, 4, 5] },
      { quarter: 'Q3', months: [6, 7, 8] },
      { quarter: 'Q4', months: [9, 10, 11] },
    ].map((q) => {
      const quarterOrders = orders.filter((o) => {
        const month = new Date(o.createdAt).getMonth();
        return q.months.includes(month);
      });

      const revenue = quarterOrders.reduce((sum, o) => sum + o.subtotal, 0);
      return {
        quarter: q.quarter,
        revenue,
        orders: quarterOrders.length,
        grossProfit: revenue * 0.65,
        netIncome: revenue * 0.40,
      };
    });

    // Product performance for schedule C
    const productSales: Record<string, { name: string; quantity: number; revenue: number; cogs: number }> = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const productId = item.variant.product.id;
        if (!productSales[productId]) {
          productSales[productId] = {
            name: item.variant.product.name,
            quantity: 0,
            revenue: 0,
            cogs: 0,
          };
        }
        const itemRevenue = item.price * item.quantity;
        productSales[productId].quantity += item.quantity;
        productSales[productId].revenue += itemRevenue;
        productSales[productId].cogs += itemRevenue * 0.35;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 20);

    // Customer metrics
    const uniqueCustomers = new Set(orders.map((o) => o.customerEmail)).size;
    const repeatCustomers = orders.length - uniqueCustomers;
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Tax summary for Schedule C
    const taxSummary = {
      grossReceipts: grossRevenue,
      returnsAndAllowances: totalRefunds,
      netReceipts: grossRevenue - totalRefunds,
      costOfGoodsSold: estimatedCOGS,
      grossProfit: grossProfit,
      otherIncome: shippingCollected, // Shipping charged to customers
      grossIncome: grossProfit + shippingCollected,

      // Expenses (Schedule C Part II)
      expenses: {
        advertising: operatingExpenses.marketing,
        commissions: operatingExpenses.paymentProcessing,
        supplies: operatingExpenses.packaging,
        utilities: 0, // Would need actual data
        wages: 0, // Would need actual data
        otherExpenses: operatingExpenses.platformFees + operatingExpenses.shipping,
        totalExpenses: totalOperatingExpenses - conservationDonations, // Donations separate
      },

      // Charitable contributions (limited)
      charitableContributions: conservationDonations,

      // Tentative profit
      tentativeProfit: operatingIncome,

      // Self-employment tax
      selfEmploymentTax: estimatedSETax,

      // Estimated quarterly payments needed
      estimatedQuarterlyPayment: (estimatedSETax + estimatedIncomeTax) / 4,
    };

    // Sales tax collected (for state reporting)
    const salesTaxByState: Record<string, number> = {};
    orders.forEach((order) => {
      const state = order.shippingState || 'Unknown';
      if (!salesTaxByState[state]) {
        salesTaxByState[state] = 0;
      }
      salesTaxByState[state] += order.tax;
    });

    return NextResponse.json({
      reportPeriod: {
        year,
        quarter: quarter || 'Full Year',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        generatedAt: new Date().toISOString(),
      },

      // Profit & Loss Statement
      profitAndLoss: {
        revenue: {
          grossSales: grossRevenue,
          shippingIncome: shippingCollected,
          returns: -totalRefunds,
          netRevenue: netRevenue - taxCollected, // Excluding sales tax
        },
        costOfGoodsSold: {
          materials: estimatedCOGS * 0.7,
          labor: estimatedCOGS * 0.2,
          overhead: estimatedCOGS * 0.1,
          totalCOGS: estimatedCOGS,
        },
        grossProfit,
        operatingExpenses,
        totalOperatingExpenses,
        operatingIncome,
        taxes: {
          salesTaxCollected: taxCollected,
          estimatedSETax,
          estimatedIncomeTax,
        },
        netIncome: netIncomeAfterTax,
      },

      // Key metrics
      metrics: {
        totalOrders: orders.length,
        totalRevenue,
        averageOrderValue,
        grossMargin: grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 0,
        netMargin: grossRevenue > 0 ? (operatingIncome / grossRevenue) * 100 : 0,
        uniqueCustomers,
        repeatCustomers,
        returnRate: orders.length > 0 ? (returns.length / orders.length) * 100 : 0,
      },

      // Monthly breakdown
      monthlyData,

      // Quarterly breakdown
      quarterlyData,

      // Top products
      topProducts,

      // Tax summary (for Schedule C)
      taxSummary,

      // Sales tax by state
      salesTaxByState: Object.entries(salesTaxByState)
        .map(([state, amount]) => ({ state, amount }))
        .sort((a, b) => b.amount - a.amount),

      // Conservation impact
      conservationImpact: {
        totalDonations: conservationDonations,
        ordersWithDonations: orders.filter((o) => o.conservationDonation).length,
        averageDonation: orders.filter((o) => o.conservationDonation).length > 0
          ? conservationDonations / orders.filter((o) => o.conservationDonation).length
          : 0,
      },
    });
  } catch (error) {
    console.error('Fetch comprehensive report error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comprehensive financial report' },
      { status: 500 }
    );
  }
}
