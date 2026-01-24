import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Map frontend priority to database enum
const priorityMap: Record<string, 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'> = {
  'low': 'LOW',
  'medium': 'MEDIUM',
  'high': 'HIGH',
  'urgent': 'URGENT'
};

const createTicketSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  category: z.string().default('general'),
  priority: z.string().default('medium'),
  customerEmail: z.string().email(),
  customerName: z.string(),
  message: z.string().min(1, 'Message is required'),
  orderId: z.string().optional(),
}).transform((data) => ({
  ...data,
  // Convert lowercase priority to uppercase enum value
  priority: priorityMap[data.priority.toLowerCase()] || 'MEDIUM',
}));

// GET - Fetch support tickets
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const assignedTo = searchParams.get('assignedTo');

    const where: Record<string, unknown> = {};

    if (status && status !== 'all') {
      // Normalize status - frontend sends lowercase, DB uses uppercase enums
      const statusMap: Record<string, string> = {
        'open': 'OPEN',
        'in_progress': 'IN_PROGRESS',
        'waiting': 'WAITING',
        'resolved': 'RESOLVED',
        'closed': 'CLOSED'
      };
      where.status = statusMap[status] || status.toUpperCase();
    }
    if (priority && priority !== 'all') {
      // Normalize priority - frontend sends lowercase, DB uses uppercase enums
      const priorityMap: Record<string, string> = {
        'low': 'LOW',
        'medium': 'MEDIUM',
        'high': 'HIGH',
        'urgent': 'URGENT'
      };
      where.priority = priorityMap[priority] || priority.toUpperCase();
    }
    if (category && category !== 'all') {
      where.category = category;
    }
    if (assignedTo) {
      where.assignedToId = assignedTo;
    }
    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { ticketNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: {
          customer: { select: { name: true, email: true } },
          _count: { select: { messages: true } },
        },
        orderBy: [
          { priority: 'desc' },
          { updatedAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.supportTicket.count({ where }),
    ]);

    // Get stats
    const statusCounts = await prisma.supportTicket.groupBy({
      by: ['status'],
      _count: true,
    });

    const priorityCounts = await prisma.supportTicket.groupBy({
      by: ['priority'],
      _count: true,
    });

    const openCount = await prisma.supportTicket.count({
      where: { status: { in: ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER'] as const } },
    });

    // avgResponseTime skipped as firstResponseAt is not in schema
    
    return NextResponse.json({
      tickets,
      stats: {
        total,
        open: openCount,
        byStatus: statusCounts.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {} as Record<string, number>),
        byPriority: priorityCounts.reduce((acc, item) => {
          acc[item.priority] = item._count;
          return acc;
        }, {} as Record<string, number>),
        avgResponseTimeMinutes: null,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Fetch support tickets error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch support tickets' },
      { status: 500 }
    );
  }
}

// POST - Create new support ticket
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createTicketSchema.parse(body);

    // Generate ticket number
    const count = await prisma.supportTicket.count();
    const ticketNumber = `TKT-${String(count + 1).padStart(6, '0')}`;

    // Check if customer exists
    const customer = await prisma.user.findUnique({
      where: { email: validated.customerEmail },
    });

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        subject: validated.subject,
        category: validated.category,
        priority: validated.priority,
        customerId: customer?.id || null,
        customerEmail: validated.customerEmail,
        customerName: validated.customerName,
        description: validated.message, // Initial message as description
        orderId: validated.orderId || null,
        status: 'OPEN',
        messages: {
          create: {
            senderEmail: validated.customerEmail,
            senderName: validated.customerName,
            senderId: customer?.id,
            isStaff: false,
            content: validated.message,
          },
        },
      },
      include: {
        messages: true,
      },
    });

    return NextResponse.json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error('Create support ticket error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create support ticket' },
      { status: 500 }
    );
  }
}
