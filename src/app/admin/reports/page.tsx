'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
  Brain,
  Calendar,
  Receipt,
  PiggyBank,
  Building2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Calculator,
  FileText,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ReportData {
  reportPeriod: {
    year: number;
    quarter: string;
    startDate: string;
    endDate: string;
    generatedAt: string;
  };
  profitAndLoss: {
    revenue: {
      grossSales: number;
      shippingIncome: number;
      returns: number;
      netRevenue: number;
    };
    costOfGoodsSold: {
      materials: number;
      labor: number;
      overhead: number;
      totalCOGS: number;
    };
    grossProfit: number;
    operatingExpenses: {
      shipping: number;
      paymentProcessing: number;
      platformFees: number;
      packaging: number;
      marketing: number;
      conservation: number;
    };
    totalOperatingExpenses: number;
    operatingIncome: number;
    taxes: {
      salesTaxCollected: number;
      estimatedSETax: number;
      estimatedIncomeTax: number;
    };
    netIncome: number;
  };
  metrics: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    grossMargin: number;
    netMargin: number;
    uniqueCustomers: number;
    repeatCustomers: number;
    returnRate: number;
  };
  monthlyData: Array<{
    month: string;
    revenue: number;
    orders: number;
    cogs: number;
    grossProfit: number;
    expenses: number;
    netIncome: number;
  }>;
  quarterlyData: Array<{
    quarter: string;
    revenue: number;
    orders: number;
    grossProfit: number;
    netIncome: number;
  }>;
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
    cogs: number;
  }>;
  taxSummary: {
    grossReceipts: number;
    returnsAndAllowances: number;
    netReceipts: number;
    costOfGoodsSold: number;
    grossProfit: number;
    otherIncome: number;
    grossIncome: number;
    expenses: {
      advertising: number;
      commissions: number;
      supplies: number;
      otherExpenses: number;
      totalExpenses: number;
    };
    charitableContributions: number;
    tentativeProfit: number;
    selfEmploymentTax: number;
    estimatedQuarterlyPayment: number;
  };
  salesTaxByState: Array<{
    state: string;
    amount: number;
  }>;
  conservationImpact: {
    totalDonations: number;
    ordersWithDonations: number;
    averageDonation: number;
  };
}

export default function ComprehensiveReportsPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(2025);
  const [quarter, setQuarter] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'summary' | 'pnl' | 'tax' | 'products'>('summary');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    revenue: true,
    cogs: false,
    expenses: false,
    monthly: false,
  });

  // AI Assistant State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [showAiPanel, setShowAiPanel] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('year', year.toString());
      if (quarter) params.set('quarter', quarter);

      const response = await fetch(`/api/admin/reports/comprehensive?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setReport(data);
      } else {
        toast.error(data.error || 'Failed to fetch report');
      }
    } catch (error) {
      console.error('Fetch report error:', error);
      toast.error('Failed to fetch report');
    } finally {
      setLoading(false);
    }
  }, [year, quarter]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const exportToExcel = async () => {
    if (!report) return;

    try {
      toast.loading('Generating Excel file...');

      const response = await fetch('/api/admin/reports/export-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportData: report, reportType: 'comprehensive' }),
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `La Pesqueria's Studio-Financial-Report-${year}-${quarter || 'Full-Year'}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success('Excel file downloaded!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to export Excel file');
      console.error('Export error:', error);
    }
  };

  const askAiAssistant = async (requestType: string) => {
    if (!report) return;

    setAiLoading(true);
    setShowAiPanel(true);
    setAiResponse('');

    try {
      const response = await fetch('/api/admin/reports/ai-tax-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportData: report, requestType }),
      });

      const data = await response.json();

      if (response.ok) {
        setAiResponse(data.response);
      } else {
        toast.error(data.error || 'AI assistant unavailable');
        setAiResponse(`Error: ${data.error || 'AI assistant is not available. Please check your ANTHROPIC_API_KEY configuration.'}`);
      }
    } catch (error) {
      console.error('AI Assistant error:', error);
      toast.error('Failed to get AI response');
      setAiResponse('Failed to connect to AI assistant. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-cyan-600" />
          <p className="mt-2 text-gray-600">Loading financial report...</p>
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Financial Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive P&L, tax summaries, and AI-powered insights for your bookkeeper
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button
            onClick={() => askAiAssistant('schedule_c')}
            variant="outline"
            className="border-purple-500 text-purple-600 hover:bg-purple-50"
          >
            <Brain className="h-4 w-4 mr-2" />
            AI Tax Assistant
          </Button>
        </div>
      </div>

      {/* Period Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              >
                {Array.from({ length: 21 }, (_, i) => 2025 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quarter</label>
              <select
                value={quarter}
                onChange={(e) => setQuarter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              >
                <option value="">Full Year</option>
                <option value="Q1">Q1 (Jan-Mar)</option>
                <option value="Q2">Q2 (Apr-Jun)</option>
                <option value="Q3">Q3 (Jul-Sep)</option>
                <option value="Q4">Q4 (Oct-Dec)</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchReport} variant="outline" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Update Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-4 overflow-x-auto">
          {[
            { id: 'summary', label: 'Executive Summary', icon: TrendingUp },
            { id: 'pnl', label: 'Profit & Loss', icon: DollarSign },
            { id: 'tax', label: 'Tax Summary', icon: Receipt },
            { id: 'products', label: 'Product Performance', icon: Building2 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-cyan-600 text-cyan-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Revenue"
              value={formatCurrency(report.metrics.totalRevenue)}
              icon={DollarSign}
              color="cyan"
            />
            <MetricCard
              title="Net Income"
              value={formatCurrency(report.profitAndLoss.netIncome)}
              subtitle={`${formatPercent(report.metrics.netMargin)} margin`}
              icon={report.profitAndLoss.netIncome >= 0 ? TrendingUp : TrendingDown}
              color={report.profitAndLoss.netIncome >= 0 ? 'green' : 'red'}
            />
            <MetricCard
              title="Total Orders"
              value={report.metrics.totalOrders.toLocaleString()}
              subtitle={`${formatCurrency(report.metrics.averageOrderValue)} avg`}
              icon={Receipt}
              color="blue"
            />
            <MetricCard
              title="Conservation Impact"
              value={formatCurrency(report.conservationImpact.totalDonations)}
              subtitle={`${report.conservationImpact.ordersWithDonations} donations`}
              icon={PiggyBank}
              color="emerald"
            />
          </div>

          {/* Quarterly Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Quarterly Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {report.quarterlyData.map((q) => (
                  <div
                    key={q.quarter}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <h4 className="font-semibold text-lg">{q.quarter}</h4>
                    <p className="text-2xl font-bold text-cyan-600">
                      {formatCurrency(q.revenue)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {q.orders} orders
                    </p>
                    <p className="text-sm text-green-600">
                      {formatCurrency(q.netIncome)} profit
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Breakdown */}
          <Card>
            <CardHeader
              className="cursor-pointer"
              onClick={() => toggleSection('monthly')}
            >
              <div className="flex justify-between items-center">
                <CardTitle>Monthly Breakdown</CardTitle>
                {expandedSections.monthly ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </CardHeader>
            {expandedSections.monthly && (
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Month</th>
                        <th className="text-right py-2">Revenue</th>
                        <th className="text-right py-2">Orders</th>
                        <th className="text-right py-2">COGS</th>
                        <th className="text-right py-2">Gross Profit</th>
                        <th className="text-right py-2">Net Income</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.monthlyData.map((m) => (
                        <tr key={m.month} className="border-b">
                          <td className="py-2 font-medium">{m.month}</td>
                          <td className="text-right">{formatCurrency(m.revenue)}</td>
                          <td className="text-right">{m.orders}</td>
                          <td className="text-right">{formatCurrency(m.cogs)}</td>
                          <td className="text-right">{formatCurrency(m.grossProfit)}</td>
                          <td className={`text-right ${m.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(m.netIncome)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'pnl' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss Statement</CardTitle>
              <CardDescription>
                {report.reportPeriod.quarter} {report.reportPeriod.year}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Revenue Section */}
              <div>
                <button
                  onClick={() => toggleSection('revenue')}
                  className="w-full flex justify-between items-center py-2 font-semibold text-lg border-b"
                >
                  <span>REVENUE</span>
                  {expandedSections.revenue ? <ChevronUp /> : <ChevronDown />}
                </button>
                {expandedSections.revenue && (
                  <div className="mt-2 space-y-2 pl-4">
                    <LineItem label="Gross Sales" value={report.profitAndLoss.revenue.grossSales} />
                    <LineItem label="Shipping Income" value={report.profitAndLoss.revenue.shippingIncome} />
                    <LineItem label="Returns & Allowances" value={report.profitAndLoss.revenue.returns} isNegative />
                    <LineItem label="NET REVENUE" value={report.profitAndLoss.revenue.netRevenue} isBold />
                  </div>
                )}
              </div>

              {/* COGS Section */}
              <div>
                <button
                  onClick={() => toggleSection('cogs')}
                  className="w-full flex justify-between items-center py-2 font-semibold text-lg border-b"
                >
                  <span>COST OF GOODS SOLD</span>
                  {expandedSections.cogs ? <ChevronUp /> : <ChevronDown />}
                </button>
                {expandedSections.cogs && (
                  <div className="mt-2 space-y-2 pl-4">
                    <LineItem label="Materials" value={report.profitAndLoss.costOfGoodsSold.materials} />
                    <LineItem label="Labor" value={report.profitAndLoss.costOfGoodsSold.labor} />
                    <LineItem label="Overhead" value={report.profitAndLoss.costOfGoodsSold.overhead} />
                    <LineItem label="TOTAL COGS" value={report.profitAndLoss.costOfGoodsSold.totalCOGS} isBold />
                  </div>
                )}
              </div>

              {/* Gross Profit */}
              <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-lg">
                <LineItem label="GROSS PROFIT" value={report.profitAndLoss.grossProfit} isBold isLarge />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Gross Margin: {formatPercent(report.metrics.grossMargin)}
                </p>
              </div>

              {/* Operating Expenses */}
              <div>
                <button
                  onClick={() => toggleSection('expenses')}
                  className="w-full flex justify-between items-center py-2 font-semibold text-lg border-b"
                >
                  <span>OPERATING EXPENSES</span>
                  {expandedSections.expenses ? <ChevronUp /> : <ChevronDown />}
                </button>
                {expandedSections.expenses && (
                  <div className="mt-2 space-y-2 pl-4">
                    <LineItem label="Marketing & Advertising" value={report.profitAndLoss.operatingExpenses.marketing} />
                    <LineItem label="Payment Processing" value={report.profitAndLoss.operatingExpenses.paymentProcessing} />
                    <LineItem label="Shipping & Delivery" value={report.profitAndLoss.operatingExpenses.shipping} />
                    <LineItem label="Packaging & Supplies" value={report.profitAndLoss.operatingExpenses.packaging} />
                    <LineItem label="Platform & Software" value={report.profitAndLoss.operatingExpenses.platformFees} />
                    <LineItem label="Conservation Donations" value={report.profitAndLoss.operatingExpenses.conservation} />
                    <LineItem label="TOTAL EXPENSES" value={report.profitAndLoss.totalOperatingExpenses} isBold />
                  </div>
                )}
              </div>

              {/* Operating Income */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <LineItem label="OPERATING INCOME" value={report.profitAndLoss.operatingIncome} isBold isLarge />
              </div>

              {/* Net Income */}
              <div className={`p-4 rounded-lg ${report.profitAndLoss.netIncome >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                <LineItem label="NET INCOME (After Estimated Taxes)" value={report.profitAndLoss.netIncome} isBold isLarge />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Net Margin: {formatPercent(report.metrics.netMargin)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'tax' && (
        <div className="space-y-6">
          {/* Tax Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Schedule C Summary
              </CardTitle>
              <CardDescription>
                Data prepared for IRS Schedule C (Form 1040) - Profit or Loss from Business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">Disclaimer</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      This summary is for informational purposes only. Please consult a qualified tax professional
                      for official tax filing. Values are estimates based on available data.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Part I - Income */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg border-b pb-2">Part I - Income</h3>
                  <LineItem label="Line 1: Gross receipts" value={report.taxSummary.grossReceipts} />
                  <LineItem label="Line 2: Returns & allowances" value={report.taxSummary.returnsAndAllowances} />
                  <LineItem label="Line 3: Net receipts" value={report.taxSummary.netReceipts} />
                  <LineItem label="Line 4: Cost of goods sold" value={report.taxSummary.costOfGoodsSold} />
                  <LineItem label="Line 5: Gross profit" value={report.taxSummary.grossProfit} isBold />
                  <LineItem label="Line 6: Other income" value={report.taxSummary.otherIncome} />
                  <LineItem label="Line 7: Gross income" value={report.taxSummary.grossIncome} isBold />
                </div>

                {/* Part II - Expenses */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg border-b pb-2">Part II - Expenses</h3>
                  <LineItem label="Line 8: Advertising" value={report.taxSummary.expenses.advertising} />
                  <LineItem label="Line 10: Commissions/fees" value={report.taxSummary.expenses.commissions} />
                  <LineItem label="Line 22: Supplies" value={report.taxSummary.expenses.supplies} />
                  <LineItem label="Line 27a: Other expenses" value={report.taxSummary.expenses.otherExpenses} />
                  <LineItem label="Line 28: Total expenses" value={report.taxSummary.expenses.totalExpenses} isBold />
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mt-4">
                <LineItem label="Line 29: Tentative Profit" value={report.taxSummary.tentativeProfit} isBold isLarge />
              </div>
            </CardContent>
          </Card>

          {/* Estimated Taxes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Estimated Tax Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Self-Employment Tax</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(report.taxSummary.selfEmploymentTax)}
                  </p>
                  <p className="text-xs text-gray-500">15.3% of net SE income</p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Quarterly Payment</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(report.taxSummary.estimatedQuarterlyPayment)}
                  </p>
                  <p className="text-xs text-gray-500">Form 1040-ES due dates</p>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Charitable Contributions</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(report.taxSummary.charitableContributions)}
                  </p>
                  <p className="text-xs text-gray-500">Conservation donations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sales Tax by State */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Tax Collected by State</CardTitle>
              <CardDescription>For state sales tax filing requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {report.salesTaxByState.map((s) => (
                  <div key={s.state} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="font-semibold">{s.state}</p>
                    <p className="text-lg">{formatCurrency(s.amount)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Tax Assistant */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI Tax Assistant (Powered by Claude)
              </CardTitle>
              <CardDescription>
                Get AI-powered tax guidance, Schedule C preparation help, and planning recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  onClick={() => askAiAssistant('schedule_c')}
                  disabled={aiLoading}
                  className="h-auto py-3 flex flex-col items-center gap-2"
                >
                  <FileText className="h-5 w-5" />
                  <span className="text-sm">Schedule C Help</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => askAiAssistant('tax_planning')}
                  disabled={aiLoading}
                  className="h-auto py-3 flex flex-col items-center gap-2"
                >
                  <Calculator className="h-5 w-5" />
                  <span className="text-sm">Tax Planning</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => askAiAssistant('quarterly_estimate')}
                  disabled={aiLoading}
                  className="h-auto py-3 flex flex-col items-center gap-2"
                >
                  <Calendar className="h-5 w-5" />
                  <span className="text-sm">Quarterly Estimates</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => askAiAssistant('year_end_checklist')}
                  disabled={aiLoading}
                  className="h-auto py-3 flex flex-col items-center gap-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm">Year-End Checklist</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'products' && (
        <Card>
          <CardHeader>
            <CardTitle>Product Performance</CardTitle>
            <CardDescription>Top 20 products by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3">Product</th>
                    <th className="text-right py-3">Units Sold</th>
                    <th className="text-right py-3">Revenue</th>
                    <th className="text-right py-3">COGS</th>
                    <th className="text-right py-3">Gross Profit</th>
                    <th className="text-right py-3">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {report.topProducts.map((p, i) => {
                    const profit = p.revenue - p.cogs;
                    const margin = p.revenue > 0 ? (profit / p.revenue) * 100 : 0;
                    return (
                      <tr key={i} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 font-medium">{p.name}</td>
                        <td className="text-right">{p.quantity}</td>
                        <td className="text-right">{formatCurrency(p.revenue)}</td>
                        <td className="text-right text-gray-600">{formatCurrency(p.cogs)}</td>
                        <td className="text-right text-green-600">{formatCurrency(profit)}</td>
                        <td className="text-right">{formatPercent(margin)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Response Panel */}
      {showAiPanel && (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader className="bg-purple-50 dark:bg-purple-900/20">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI Tax Assistant Response
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowAiPanel(false)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {aiLoading ? (
              <div className="flex items-center gap-3 py-8">
                <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                <span>AI is analyzing your financial data...</span>
              </div>
            ) : (
              <div className="prose dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
                  {aiResponse}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper Components
function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'cyan' | 'green' | 'red' | 'blue' | 'emerald';
}) {
  const colorClasses = {
    cyan: 'text-cyan-600',
    green: 'text-green-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
    emerald: 'text-emerald-600',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
        <Icon className={`h-5 w-5 ${colorClasses[color]}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</div>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

function LineItem({
  label,
  value,
  isNegative = false,
  isBold = false,
  isLarge = false,
}: {
  label: string;
  value: number;
  isNegative?: boolean;
  isBold?: boolean;
  isLarge?: boolean;
}) {
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Math.abs(value));

  return (
    <div className={`flex justify-between items-center ${isLarge ? 'py-2' : 'py-1'}`}>
      <span className={isBold ? 'font-semibold' : ''}>{label}</span>
      <span
        className={`${isBold ? 'font-bold' : ''} ${isLarge ? 'text-xl' : ''} ${
          isNegative || value < 0 ? 'text-red-600' : ''
        }`}
      >
        {isNegative || value < 0 ? `(${formattedValue})` : formattedValue}
      </span>
    </div>
  );
}
