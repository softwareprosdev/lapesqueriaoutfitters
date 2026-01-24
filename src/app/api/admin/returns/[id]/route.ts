import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateReturnSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'RECEIVED', 'INSPECTING', 'REFUND_PENDING', 'REFUNDED', 'REJECTED', 'CANCELLED']).optional(),
  refundAmount: z.number().optional(),
  refundMethod: z.string().optional(),
  returnLabelUrl: z.string().optional(),
  returnTrackingNumber: z.string().optional(),
  returnCarrier: z.string().optional(),
  rejectionReason: z.string().optional(),
  internalNotes: z.string().optional(),
  items: z.array(z.object({
    id: z.string(),
    condition: z.string().optional(),
    restockable: z.boolean().optional(),
  })).optional(),
});

// GET - Get single return
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const returnRequest = await prisma.return.findUnique({
      where: { id },
      include: {
        order: {
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
          },
        },
        items: true,
      },
    });

    if (!returnRequest) {
      return NextResponse.json({ error: 'Return not found' }, { status: 404 });
    }

    return NextResponse.json({ return: returnRequest });
  } catch (error) {
    console.error('Fetch return error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch return' },
      { status: 500 }
    );
  }
}

// PATCH - Update return
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validated = updateReturnSchema.parse(body);

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (validated.status) {
      updateData.status = validated.status;

      // Set timestamps based on status
      if (validated.status === 'APPROVED') {
        updateData.approvedAt = new Date();
        updateData.approvedBy = session.user.id;
      } else if (validated.status === 'RECEIVED') {
        updateData.receivedAt = new Date();
      } else if (validated.status === 'INSPECTING') {
        updateData.inspectedAt = new Date();
      } else if (validated.status === 'REFUNDED') {
        updateData.refundedAt = new Date();
      }
    }

    if (validated.refundAmount !== undefined) updateData.refundAmount = validated.refundAmount;
    if (validated.refundMethod) updateData.refundMethod = validated.refundMethod;
    if (validated.returnLabelUrl) updateData.returnLabelUrl = validated.returnLabelUrl;
    if (validated.returnTrackingNumber) updateData.returnTrackingNumber = validated.returnTrackingNumber;
    if (validated.returnCarrier) updateData.returnCarrier = validated.returnCarrier;
    if (validated.rejectionReason) updateData.rejectionReason = validated.rejectionReason;
    if (validated.internalNotes !== undefined) updateData.internalNotes = validated.internalNotes;

    const returnRequest = await prisma.return.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        order: true,
      },
    });

    // Update return items if provided
    if (validated.items && validated.items.length > 0) {
      for (const item of validated.items) {
        await prisma.returnItem.update({
          where: { id: item.id },
          data: {
            condition: item.condition,
            restockable: item.restockable,
          },
        });
      }
    }

    return NextResponse.json({ return: returnRequest });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid return data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Update return error:', error);
    return NextResponse.json(
      { error: 'Failed to update return' },
      { status: 500 }
    );
  }
}

// DELETE - Delete return
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.return.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Return deleted successfully' });
  } catch (error) {
    console.error('Delete return error:', error);
    return NextResponse.json(
      { error: 'Failed to delete return' },
      { status: 500 }
    );
  }
}
