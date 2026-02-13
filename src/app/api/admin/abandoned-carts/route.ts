import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import AbandonedCartRecoveryEmail from '@/emails/AbandonedCartRecovery';

// Note: This uses analytics events to track abandoned carts
// A cart is considered abandoned if:
// - User added items to cart (ADD_TO_CART event)
// - No purchase event followed within 24 hours
// - Session is at least 1 hour old (to avoid counting active shoppers)

// GET - Fetch abandoned cart data
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _status = searchParams.get('status') || 'all'; // Reserved for future filtering

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000); // Reserved for future filtering
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Get sessions with ADD_TO_CART but no PURCHASE
    const abandonedSessions = await prisma.$queryRaw<Array<{
      sessionId: string;
      userId: string | null;
      lastActivity: Date;
      cartValue: number;
      itemCount: number;
    }>>`
      SELECT
        e."sessionId" as "sessionId",
        e."userId" as "userId",
        MAX(e.timestamp) as "lastActivity",
        COUNT(DISTINCT e."productId") as "itemCount",
        COALESCE(SUM((e.metadata->>'price')::numeric * (e.metadata->>'quantity')::numeric), 0) as "cartValue"
      FROM analytics_events e
      WHERE e."eventType" = 'ADD_TO_CART'
        AND e.timestamp < ${oneHourAgo}
        AND NOT EXISTS (
          SELECT 1 FROM analytics_events p
          WHERE p."sessionId" = e."sessionId"
            AND p."eventType" = 'PURCHASE'
        )
      GROUP BY e."sessionId", e."userId"
      ORDER BY MAX(e.timestamp) DESC
      LIMIT ${limit}
      OFFSET ${(page - 1) * limit}
    `;

    // Get total count
    const totalCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(DISTINCT "sessionId") as count
      FROM analytics_events
      WHERE "eventType" = 'ADD_TO_CART'
        AND timestamp < ${oneHourAgo}
        AND NOT EXISTS (
          SELECT 1 FROM analytics_events p
          WHERE p."sessionId" = analytics_events."sessionId"
            AND p."eventType" = 'PURCHASE'
        )
    `;

    // Get user details for sessions with userId
    const userIds = abandonedSessions
      .filter(s => s.userId)
      .map(s => s.userId as string);

    const users = userIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, email: true, name: true },
        })
      : [];

    const userMap = new Map(users.map(u => [u.id, u]));

    // Get cart items for each session
    const cartsWithDetails = await Promise.all(
      abandonedSessions.map(async (cart) => {
        const items = await prisma.$queryRaw<Array<{
          productId: string;
          variantId: string;
          quantity: number;
          price: number;
        }>>`
          SELECT DISTINCT
            e."productId" as "productId",
            e."variantId" as "variantId",
            (e.metadata->>'quantity')::int as "quantity",
            (e.metadata->>'price')::numeric as "price"
          FROM analytics_events e
          WHERE e."sessionId" = ${cart.sessionId}
            AND e."eventType" = 'ADD_TO_CART'
        `;

        // Get product details
        const productIds = items.map(i => i.productId).filter(Boolean);
        const products = productIds.length > 0
          ? await prisma.product.findMany({
              where: { id: { in: productIds } },
              select: { id: true, name: true, slug: true },
            })
          : [];
        const productMap = new Map(products.map(p => [p.id, p]));

        return {
          ...cart,
          user: cart.userId ? userMap.get(cart.userId) : null,
          items: items.map(item => ({
            ...item,
            productName: productMap.get(item.productId)?.name || 'Unknown Product',
          })),
          recoveryEmailSent: false, // TODO: Track this in a separate table
          timeSinceAbandoned: Date.now() - new Date(cart.lastActivity).getTime(),
        };
      })
    );

    // Calculate stats
    const totalValue = abandonedSessions.reduce((sum, c) => sum + Number(c.cartValue), 0);
    const avgValue = abandonedSessions.length > 0 ? totalValue / abandonedSessions.length : 0;

    // Get recovery stats from email logs
    const emailsSent = await prisma.emailLog.count({
      where: {
        template: 'ADMIN_CUSTOM',
        variables: { path: ['type'], equals: 'abandoned_cart_recovery' },
        status: 'sent',
      },
    });

    const stats = {
      totalAbandoned: Number(totalCount[0]?.count || 0),
      totalValue,
      averageValue: avgValue,
      recoveryRate: 0,
      emailsSent,
      recovered: 0,
      recoveredValue: 0,
    };

    return NextResponse.json({
      carts: cartsWithDetails,
      stats,
      pagination: {
        page,
        limit,
        total: Number(totalCount[0]?.count || 0),
        totalPages: Math.ceil(Number(totalCount[0]?.count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Fetch abandoned carts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch abandoned carts' },
      { status: 500 }
    );
  }
}

// POST - Send recovery email
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, email, items, cartValue } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Create email log record
    const emailLog = await prisma.emailLog.create({
      data: {
        to: email,
        subject: "Complete Your Order at La Pesqueria Outfitters",
        template: 'ADMIN_CUSTOM',
        status: 'pending',
        variables: {
          sessionId,
          items,
          cartValue,
          type: 'abandoned_cart_recovery',
        },
      },
    });

    // Send the actual recovery email via Resend
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'https://lapesqueriaoutfitters.com';
      await sendEmail({
        to: email,
        subject: "Complete Your Order at La Pesqueria Outfitters",
        react: AbandonedCartRecoveryEmail({
          items: items?.map((item: { productName?: string; name?: string; quantity: number; price: number }) => ({
            productName: item.productName || item.name || 'Product',
            quantity: item.quantity || 1,
            price: item.price || 0,
          })) || [],
          cartValue: cartValue || 0,
          checkoutUrl: `${baseUrl}/shop`,
        }),
      });

      // Update log status to sent
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: { status: 'sent', sentAt: new Date() },
      });
    } catch (emailError) {
      console.error('Failed to send recovery email:', emailError);
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'failed',
          error: emailError instanceof Error ? emailError.message : 'Unknown error',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Recovery email sent',
    });
  } catch (error) {
    console.error('Send recovery email error:', error);
    return NextResponse.json(
      { error: 'Failed to send recovery email' },
      { status: 500 }
    );
  }
}
