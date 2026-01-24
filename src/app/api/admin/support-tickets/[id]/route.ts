import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateTicketSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assignedToId: z.string().optional().nullable(),
  category: z.string().optional(),
});

const addMessageSchema = z.object({
  content: z.string().min(1, 'Message is required'),
  isInternal: z.boolean().optional().default(false),
});

// GET - Fetch single ticket with messages
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: { select: { name: true, email: true } },
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Manually fetch related data since relations aren't defined in schema
    let assignedToObj = null;
    if (ticket.assignedTo) {
      assignedToObj = await prisma.user.findUnique({
        where: { id: ticket.assignedTo },
        select: { id: true, name: true, email: true },
      });
    }

    let orderObj = null;
    if (ticket.orderId) {
      orderObj = await prisma.order.findUnique({
        where: { id: ticket.orderId },
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          createdAt: true,
        },
      });
    }

    return NextResponse.json({
      ticket: {
        ...ticket,
        assignedTo: assignedToObj,
        order: orderObj,
      },
    });
  } catch (error) {
    console.error('Fetch ticket error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    );
  }
}

// PATCH - Update ticket or add message
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if it's a message or update
    if (body.action === 'add_message') {
      const validated = addMessageSchema.parse(body);

      // firstResponseAt removed - not in schema

      const message = await prisma.ticketMessage.create({
        data: {
          ticketId: id,
          senderId: session.user.id,
          senderEmail: session.user.email!,
          senderName: session.user.name || 'Staff',
          isStaff: true,
          content: validated.content,
        },
      });

      // Update ticket
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      // Track response timing removed - field not in schema

      // If status is open, change to in_progress
      await prisma.supportTicket.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json({ success: true, message });
    }

    // Update ticket properties
    const validated = updateTicketSchema.parse(body);
    const updateData: Record<string, unknown> = {};

    if (validated.status !== undefined) {
      updateData.status = validated.status;
      if (validated.status === 'RESOLVED' || validated.status === 'CLOSED') {
        updateData.resolvedAt = new Date();
      }
    }
    if (validated.priority !== undefined) {
      updateData.priority = validated.priority;
    }
    if (validated.assignedToId !== undefined) {
      updateData.assignedTo = validated.assignedToId;
    }
    if (validated.category !== undefined) {
      updateData.category = validated.category;
    }

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error('Update ticket error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}

// DELETE - Delete ticket
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.supportTicket.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete ticket error:', error);
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    );
  }
}
