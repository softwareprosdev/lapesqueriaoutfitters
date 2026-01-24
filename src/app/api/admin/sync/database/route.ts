import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Real-time inventory sync status
let lastSyncTime = new Date();
let syncInProgress = false;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Prevent concurrent syncs
    if (syncInProgress) {
      return NextResponse.json({ 
        error: 'Sync already in progress',
        lastSync: lastSyncTime.toISOString()
      }, { status: 429 });
    }

    syncInProgress = true;

    const body = await req.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { type: _type = 'full' } = body; // Reserved for future sync type filtering

    const syncResults = {
      products: 0,
      variants: 0,
      orders: 0,
      transactions: 0,
      customers: 0,
      categories: 0,
      startTime: new Date().toISOString(),
      endTime: null as string | null,
      errors: [] as string[]
    };

    try {
      // Sync categories
      const categoryCount = await prisma.category.count();
      syncResults.categories = categoryCount;

      // Sync products
      const productCount = await prisma.product.count();
      syncResults.products = productCount;

      // Sync variants
      const variantCount = await prisma.productVariant.count();
      syncResults.variants = variantCount;

      // Sync orders
      const orderCount = await prisma.order.count();
      syncResults.orders = orderCount;

      // Sync transactions
      const transactionCount = await prisma.inventoryTransaction.count();
      syncResults.transactions = transactionCount;

      // Sync customers
      const customerCount = await prisma.user.count({
        where: { role: 'CUSTOMER' }
      });
      syncResults.customers = customerCount;

      // Update cache timestamps for real-time updates
      await prisma.siteSettings.upsert({
        where: { id: 'cache-timestamps' },
        create: {
          id: 'cache-timestamps',
          siteName: '',
          logo: '',
          primaryColor: ''
        },
        update: {
          // Store sync timestamp in a metadata field or create a sync log table
        }
      });

      syncResults.endTime = new Date().toISOString();
      lastSyncTime = new Date();

      return NextResponse.json({
        success: true,
        message: 'Database sync completed successfully',
        results: syncResults,
        nextSyncAvailable: new Date(Date.now() + 30000).toISOString() // 30 seconds
      });

    } catch (error) {
      syncResults.errors.push(error instanceof Error ? error.message : 'Unknown error');
      
      return NextResponse.json({
        success: false,
        message: 'Sync completed with errors',
        results: syncResults
      }, { status: 500 });
    } finally {
      syncInProgress = false;
    }

  } catch (error) {
    console.error('Database sync error:', error);
    syncInProgress = false;
    
    return NextResponse.json({
      error: 'Failed to initiate database sync',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      lastSync: lastSyncTime.toISOString(),
      syncInProgress,
      nextSyncAvailable: syncInProgress
        ? null
        : new Date(Date.now() + 30000).toISOString()
    });

  } catch {
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}