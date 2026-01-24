import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import ExcelJS from 'exceljs';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { reportData } = data;

    if (!reportData) {
      return NextResponse.json({ error: 'No report data provided' }, { status: 400 });
    }

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "La Pesqueria Outfitters";
    workbook.created = new Date();
    workbook.modified = new Date();

    // ============================================
    // Sheet 1: Executive Summary
    // ============================================
    const summaryData = [
      ['LA PESQUERIA OUTFITTERS FINANCIAL REPORT'],
      [''],
      ['Report Period:', `${reportData.reportPeriod.quarter} ${reportData.reportPeriod.year}`],
      ['Generated:', new Date(reportData.reportPeriod.generatedAt).toLocaleDateString()],
      [''],
      ['EXECUTIVE SUMMARY'],
      [''],
      ['Key Metrics', 'Value'],
      ['Total Orders', reportData.metrics.totalOrders],
      ['Total Revenue', formatCurrency(reportData.metrics.totalRevenue)],
      ['Average Order Value', formatCurrency(reportData.metrics.averageOrderValue)],
      ['Gross Margin', `${reportData.metrics.grossMargin.toFixed(1)}%`],
      ['Net Margin', `${reportData.metrics.netMargin.toFixed(1)}%`],
      ['Unique Customers', reportData.metrics.uniqueCustomers],
      ['Repeat Customers', reportData.metrics.repeatCustomers],
      ['Return Rate', `${reportData.metrics.returnRate.toFixed(1)}%`],
    ];

    const summarySheet = workbook.addWorksheet('Executive Summary');
    summarySheet.addRows(summaryData);
    summarySheet.columns = [{ width: 25 }, { width: 20 }];

    // ============================================
    // Sheet 2: Profit & Loss Statement
    // ============================================
    const pnl = reportData.profitAndLoss;
    const pnlData = [
      ['PROFIT & LOSS STATEMENT'],
      ["La Pesqueria Outfitters"],
      [`For the Period: ${reportData.reportPeriod.quarter} ${reportData.reportPeriod.year}`],
      [''],
      ['REVENUE', '', ''],
      ['  Gross Sales', '', formatCurrency(pnl.revenue.grossSales)],
      ['  Shipping Income', '', formatCurrency(pnl.revenue.shippingIncome)],
      ['  Less: Returns & Allowances', '', formatCurrency(pnl.revenue.returns)],
      ['  NET REVENUE', '', formatCurrency(pnl.revenue.netRevenue)],
      [''],
      ['COST OF GOODS SOLD', '', ''],
      ['  Materials', '', formatCurrency(pnl.costOfGoodsSold.materials)],
      ['  Labor', '', formatCurrency(pnl.costOfGoodsSold.labor)],
      ['  Manufacturing Overhead', '', formatCurrency(pnl.costOfGoodsSold.overhead)],
      ['  TOTAL COGS', '', formatCurrency(pnl.costOfGoodsSold.totalCOGS)],
      [''],
      ['GROSS PROFIT', '', formatCurrency(pnl.grossProfit)],
      [''],
      ['OPERATING EXPENSES', '', ''],
      ['  Advertising & Marketing', '', formatCurrency(pnl.operatingExpenses.marketing)],
      ['  Payment Processing Fees', '', formatCurrency(pnl.operatingExpenses.paymentProcessing)],
      ['  Shipping & Delivery', '', formatCurrency(pnl.operatingExpenses.shipping)],
      ['  Packaging & Supplies', '', formatCurrency(pnl.operatingExpenses.packaging)],
      ['  Platform & Software', '', formatCurrency(pnl.operatingExpenses.platformFees)],
      ['  Conservation Donations', '', formatCurrency(pnl.operatingExpenses.conservation)],
      ['  TOTAL OPERATING EXPENSES', '', formatCurrency(pnl.totalOperatingExpenses)],
      [''],
      ['OPERATING INCOME', '', formatCurrency(pnl.operatingIncome)],
      [''],
      ['TAXES', '', ''],
      ['  Sales Tax Collected (Liability)', '', formatCurrency(pnl.taxes.salesTaxCollected)],
      ['  Estimated Self-Employment Tax', '', formatCurrency(pnl.taxes.estimatedSETax)],
      ['  Estimated Income Tax', '', formatCurrency(pnl.taxes.estimatedIncomeTax)],
      [''],
      ['NET INCOME', '', formatCurrency(pnl.netIncome)],
    ];

    const pnlSheet = workbook.addWorksheet('Profit & Loss');
    pnlSheet.addRows(pnlData);
    pnlSheet.columns = [{ width: 35 }, { width: 15 }, { width: 18 }];

    // ============================================
    // Sheet 3: Monthly Breakdown
    // ============================================
    const monthlyData = [
      ['MONTHLY PERFORMANCE'],
      [''],
      ['Month', 'Revenue', 'Orders', 'COGS', 'Gross Profit', 'Expenses', 'Net Income'],
      ...reportData.monthlyData.map((m: {
        month: string;
        revenue: number;
        orders: number;
        cogs: number;
        grossProfit: number;
        expenses: number;
        netIncome: number;
      }) => [
        m.month,
        formatCurrency(m.revenue),
        m.orders,
        formatCurrency(m.cogs),
        formatCurrency(m.grossProfit),
        formatCurrency(m.expenses),
        formatCurrency(m.netIncome),
      ]),
    ];

    const monthlySheet = workbook.addWorksheet('Monthly Breakdown');
    monthlySheet.addRows(monthlyData);
    monthlySheet.columns = [
      { width: 12 }, { width: 15 }, { width: 10 },
      { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 },
    ];

    // ============================================
    // Sheet 4: Quarterly Summary
    // ============================================
    const quarterlyDataArr = [
      ['QUARTERLY SUMMARY'],
      [''],
      ['Quarter', 'Revenue', 'Orders', 'Gross Profit', 'Net Income'],
      ...reportData.quarterlyData.map((q: {
        quarter: string;
        revenue: number;
        orders: number;
        grossProfit: number;
        netIncome: number;
      }) => [
        q.quarter,
        formatCurrency(q.revenue),
        q.orders,
        formatCurrency(q.grossProfit),
        formatCurrency(q.netIncome),
      ]),
    ];

    const quarterlySheet = workbook.addWorksheet('Quarterly Summary');
    quarterlySheet.addRows(quarterlyDataArr);
    quarterlySheet.columns = [{ width: 12 }, { width: 15 }, { width: 10 }, { width: 15 }, { width: 15 }];

    // ============================================
    // Sheet 5: Top Products
    // ============================================
    const productsData = [
      ['TOP SELLING PRODUCTS'],
      [''],
      ['Product Name', 'Units Sold', 'Revenue', 'COGS', 'Gross Profit'],
      ...reportData.topProducts.map((p: {
        name: string;
        quantity: number;
        revenue: number;
        cogs: number;
      }) => [
        p.name,
        p.quantity,
        formatCurrency(p.revenue),
        formatCurrency(p.cogs),
        formatCurrency(p.revenue - p.cogs),
      ]),
    ];

    const productsSheet = workbook.addWorksheet('Top Products');
    productsSheet.addRows(productsData);
    productsSheet.columns = [{ width: 40 }, { width: 12 }, { width: 15 }, { width: 15 }, { width: 15 }];

    // ============================================
    // Sheet 6: Tax Summary (Schedule C)
    // ============================================
    const tax = reportData.taxSummary;
    const taxData = [
      ['TAX SUMMARY - SCHEDULE C PREPARATION'],
      [''],
      ['This worksheet provides data for IRS Schedule C (Form 1040)'],
      ['Consult a tax professional for official filing'],
      [''],
      ['PART I - INCOME'],
      ['Line 1: Gross receipts or sales', formatCurrency(tax.grossReceipts)],
      ['Line 2: Returns and allowances', formatCurrency(tax.returnsAndAllowances)],
      ['Line 3: Net receipts (Line 1 - Line 2)', formatCurrency(tax.netReceipts)],
      ['Line 4: Cost of goods sold', formatCurrency(tax.costOfGoodsSold)],
      ['Line 5: Gross profit (Line 3 - Line 4)', formatCurrency(tax.grossProfit)],
      ['Line 6: Other income (shipping collected)', formatCurrency(tax.otherIncome)],
      ['Line 7: Gross income (Line 5 + Line 6)', formatCurrency(tax.grossIncome)],
      [''],
      ['PART II - EXPENSES'],
      ['Line 8: Advertising', formatCurrency(tax.expenses.advertising)],
      ['Line 10: Commissions and fees', formatCurrency(tax.expenses.commissions)],
      ['Line 22: Supplies', formatCurrency(tax.expenses.supplies)],
      ['Line 27a: Other expenses', formatCurrency(tax.expenses.otherExpenses)],
      ['Line 28: Total expenses', formatCurrency(tax.expenses.totalExpenses)],
      [''],
      ['Line 29: Tentative profit', formatCurrency(tax.tentativeProfit)],
      [''],
      ['ESTIMATED TAXES'],
      ['Self-Employment Tax (15.3%)', formatCurrency(tax.selfEmploymentTax)],
      ['Estimated Quarterly Payment', formatCurrency(tax.estimatedQuarterlyPayment)],
      [''],
      ['CHARITABLE CONTRIBUTIONS (Schedule A if itemizing)'],
      ['Conservation Donations', formatCurrency(tax.charitableContributions)],
    ];

    const taxSheet = workbook.addWorksheet('Tax Summary');
    taxSheet.addRows(taxData);
    taxSheet.columns = [{ width: 45 }, { width: 18 }];

    // ============================================
    // Sheet 7: Sales Tax by State
    // ============================================
    const salesTaxData = [
      ['SALES TAX COLLECTED BY STATE'],
      [''],
      ['Use this for state sales tax filings'],
      [''],
      ['State', 'Tax Collected'],
      ...reportData.salesTaxByState.map((s: { state: string; amount: number }) => [
        s.state,
        formatCurrency(s.amount),
      ]),
      [''],
      ['TOTAL', formatCurrency(reportData.salesTaxByState.reduce((sum: number, s: { amount: number }) => sum + s.amount, 0))],
    ];

    const salesTaxSheet = workbook.addWorksheet('Sales Tax by State');
    salesTaxSheet.addRows(salesTaxData);
    salesTaxSheet.columns = [{ width: 20 }, { width: 18 }];

    // ============================================
    // Sheet 8: Conservation Impact
    // ============================================
    const conservationData = [
      ['CONSERVATION IMPACT REPORT'],
      [''],
      ["La Pesqueria Outfitters - Supporting Marine Conservation"],
      [''],
      ['Metric', 'Value'],
      ['Total Donations', formatCurrency(reportData.conservationImpact.totalDonations)],
      ['Orders with Donations', reportData.conservationImpact.ordersWithDonations],
      ['Average Donation per Order', formatCurrency(reportData.conservationImpact.averageDonation)],
      [''],
      ['Note: Conservation donations may be tax-deductible.'],
      ['Consult your tax advisor for proper classification.'],
    ];

    const conservationSheet = workbook.addWorksheet('Conservation Impact');
    conservationSheet.addRows(conservationData);
    conservationSheet.columns = [{ width: 30 }, { width: 20 }];

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    // Return file
    const filename = `La Pesqueria Outfitters-Financial-Report-${reportData.reportPeriod.year}-${reportData.reportPeriod.quarter.replace(' ', '-')}.xlsx`;

    return new NextResponse(buffer as ArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export Excel error:', error);
    return NextResponse.json(
      { error: 'Failed to export Excel file' },
      { status: 500 }
    );
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}