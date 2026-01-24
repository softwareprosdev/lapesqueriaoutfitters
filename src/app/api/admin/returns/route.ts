import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createReturnSchema = z.object({
  orderId: z.string(),
  reason: z.enum(['DEFECTIVE', 'WRONG_ITEM', 'NOT_AS_DESCRIBED', 'CHANGED_MIND', 'SIZE_ISSUE', 'QUALITY_ISSUE', 'ARRIVED_LATE', 'OTHER']),
  reasonDetails: z.string().optional(),
  customerEmail: z.string().email(),
  customerName: z.string(),
  customerPhone: z.string().optional(),
  items: z.array(z.object({
    orderItemId: z.string(),
    variantId: z.string(),
    productName: z.string(),
    variantName: z.string().optional(),
    quantity: z.number().int().positive(),
    unitPrice: z.number(),
  })),
});

// GET - Fetch all returns with filters
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { returnNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { order: { orderNumber: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [returns, total] = await Promise.all([
      prisma.return.findMany({
        where,
        include: {
          order: {
            select: {
              orderNumber: true,
              total: true,
              createdAt: true,
            },
          },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.return.count({ where }),
    ]);

    // Get status counts
    const statusCounts = await prisma.return.groupBy({
      by: ['status'],
      _count: true,
    });

    const stats = {
      total,
      pending: statusCounts.find(s => s.status === 'PENDING')?._count || 0,
      approved: statusCounts.find(s => s.status === 'APPROVED')?._count || 0,
      received: statusCounts.find(s => s.status === 'RECEIVED')?._count || 0,
      refunded: statusCounts.find(s => s.status === 'REFUNDED')?._count || 0,
    };

    return NextResponse.json({
      returns,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Fetch returns error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch returns' },
      { status: 500 }
    );
  }
}

// POST - Create a new return request
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createReturnSchema.parse(body);

    // Calculate refund amount
    const refundAmount = validated.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    const returnRequest = await prisma.return.create({
      data: {
        orderId: validated.orderId,
        reason: validated.reason,
        reasonDetails: validated.reasonDetails,
        customerEmail: validated.customerEmail,
        customerName: validated.customerName,
        customerPhone: validated.customerPhone,
        refundAmount,
        items: {
          create: validated.items.map(item => ({
            orderItemId: item.orderItemId,
            variantId: item.variantId,
            productName: item.productName,
            variantName: item.variantName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: {
        items: true,
        order: true,
      },
    });

    return NextResponse.json({ return: returnRequest }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid return data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Create return error:', error);
    return NextResponse.json(
      { error: 'Failed to create return' },
      { status: 500 }
    );
  }
}
