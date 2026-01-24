import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'AI features not configured. Please add ANTHROPIC_API_KEY to your environment.' },
        { status: 500 }
      );
    }

    const { reportData, requestType } = await req.json();

    if (!reportData) {
      return NextResponse.json({ error: 'No report data provided' }, { status: 400 });
    }

    let prompt = '';
    let systemPrompt = '';

    switch (requestType) {
      case 'schedule_c':
        systemPrompt = `You are a professional tax advisor assistant for a small e-commerce business (La Pesqueria Outfitters - fishing apparel and outdoor gear).
You help prepare Schedule C (Form 1040) data for sole proprietors.
Always provide accurate calculations and clear explanations.
Include disclaimers that this is for informational purposes and a CPA should review.
Format all currency values with proper $ formatting.`;

        prompt = `Based on the following financial data for La Pesqueria Outfitters, please prepare a detailed Schedule C (Form 1040) breakdown with specific line items.

FINANCIAL DATA:
- Gross Receipts: $${reportData.taxSummary.grossReceipts.toFixed(2)}
- Returns and Allowances: $${reportData.taxSummary.returnsAndAllowances.toFixed(2)}
- Cost of Goods Sold: $${reportData.taxSummary.costOfGoodsSold.toFixed(2)}
- Advertising: $${reportData.taxSummary.expenses.advertising.toFixed(2)}
- Commissions/Fees (Payment Processing): $${reportData.taxSummary.expenses.commissions.toFixed(2)}
- Supplies: $${reportData.taxSummary.expenses.supplies.toFixed(2)}
- Other Expenses: $${reportData.taxSummary.expenses.otherExpenses.toFixed(2)}
- Charitable Contributions (Conservation): $${reportData.taxSummary.charitableContributions.toFixed(2)}

Business Type: Online retail (e-commerce)
Business Code: 454110 (Electronic Shopping)

Please provide:
1. Complete Schedule C line-by-line breakdown with calculated values
2. Notes on any deductions that may need documentation
3. Recommendations for maximizing legitimate deductions
4. Estimated self-employment tax calculation (Schedule SE)
5. Quarterly estimated tax payment recommendations`;
        break;

      case 'tax_planning':
        systemPrompt = `You are a tax planning advisor for a small e-commerce business.
Provide strategic tax planning advice based on financial data.
Focus on legal tax optimization strategies for sole proprietors.`;

        prompt = `Based on La Pesqueria Outfitters's financial performance:

Revenue: $${reportData.metrics.totalRevenue.toFixed(2)}
Net Income: $${reportData.profitAndLoss.netIncome.toFixed(2)}
Conservation Donations: $${reportData.conservationImpact.totalDonations.toFixed(2)}

Please provide:
1. Tax planning recommendations for the remainder of the year
2. Potential deductions the business might be missing
3. Retirement account contribution recommendations (SEP-IRA, Solo 401k)
4. Business structure considerations (LLC, S-Corp election benefits)
5. Record-keeping recommendations for audit protection`;
        break;

      case 'quarterly_estimate':
        systemPrompt = `You are a tax calculation assistant specializing in estimated quarterly taxes for self-employed individuals.`;

        prompt = `Calculate the estimated quarterly tax payments for La Pesqueria Outfitters based on:

Year-to-Date Net Income: $${reportData.profitAndLoss.operatingIncome.toFixed(2)}
Self-Employment Tax Rate: 15.3%
Estimated Federal Tax Bracket: 22%

Please provide:
1. Quarterly estimated tax breakdown
2. Form 1040-ES payment schedule
3. State tax considerations (Texas - no state income tax)
4. Safe harbor payment recommendations
5. Penalties for underpayment explanation`;
        break;

      case 'year_end_checklist':
        systemPrompt = `You are a year-end tax preparation specialist for small businesses.`;

        prompt = `Create a comprehensive year-end tax checklist for La Pesqueria Outfitters based on their data:

Total Revenue: $${reportData.metrics.totalRevenue.toFixed(2)}
Total Orders: ${reportData.metrics.totalOrders}
Conservation Donations: $${reportData.conservationImpact.totalDonations.toFixed(2)}
States with Sales: ${reportData.salesTaxByState.map((s: { state: string }) => s.state).join(', ')}

Please provide:
1. Year-end tax preparation checklist
2. Documents needed for tax filing
3. Important tax deadlines
4. 1099 requirements for contractors (if any)
5. Sales tax filing obligations by state
6. Record retention requirements`;
        break;

      default:
        systemPrompt = `You are a financial advisor for a small e-commerce business.`;
        prompt = `Provide a general financial health assessment for La Pesqueria Outfitters based on:

Revenue: $${reportData.metrics.totalRevenue.toFixed(2)}
Gross Margin: ${reportData.metrics.grossMargin.toFixed(1)}%
Net Margin: ${reportData.metrics.netMargin.toFixed(1)}%
Average Order Value: $${reportData.metrics.averageOrderValue.toFixed(2)}

Please provide insights and recommendations.`;
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const aiResponse = response.content[0].type === 'text' ? response.content[0].text : '';

    return NextResponse.json({
      success: true,
      requestType,
      response: aiResponse,
      model: response.model,
      usage: response.usage,
    });
  } catch (error) {
    console.error('AI Tax Assistant error:', error);

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `AI API Error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    );
  }
}
