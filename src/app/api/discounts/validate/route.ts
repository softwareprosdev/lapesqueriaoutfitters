import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Discount code is required' },
        { status: 400 }
      );
    }

    // Find the discount code
    const discount = await prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!discount) {
      return NextResponse.json(
        { error: 'Invalid discount code' },
        { status: 404 }
      );
    }

    // Check if discount is active
    if (!discount.isActive) {
      return NextResponse.json(
        { error: 'This discount code is no longer active' },
        { status: 400 }
      );
    }

    // Check expiration
    if (discount.expiresAt && new Date() > discount.expiresAt) {
      return NextResponse.json(
        { error: 'This discount code has expired' },
        { status: 400 }
      );
    }

    // Check if it has started
    if (discount.startsAt && new Date() < discount.startsAt) {
      return NextResponse.json(
        { error: 'This discount code is not yet active' },
        { status: 400 }
      );
    }

    // Check usage limit
    if (discount.usageLimit) {
      const usageCount = await prisma.discountUsage.count({
        where: { discountId: discount.id },
      });
      if (usageCount >= discount.usageLimit) {
        return NextResponse.json(
          { error: 'This discount code has reached its usage limit' },
          { status: 400 }
        );
      }
    }

    // Check minimum purchase amount
    if (discount.minPurchaseAmount && subtotal < discount.minPurchaseAmount) {
      return NextResponse.json(
        { 
          error: `Minimum purchase of $${discount.minPurchaseAmount.toFixed(2)} required for this discount` 
        },
        { status: 400 }
      );
    }

    // Calculate discount amount
    let discountAmount = 0;
    let discountDescription = '';

    switch (discount.type) {
      case 'PERCENTAGE':
        discountAmount = (subtotal * discount.value) / 100;
        discountDescription = `${discount.value}% off`;
        break;
      case 'FIXED_AMOUNT':
        discountAmount = Math.min(discount.value, subtotal); // Don't exceed subtotal
        discountDescription = `$${discount.value.toFixed(2)} off`;
        break;
      case 'FREE_SHIPPING':
        discountAmount = 0; // Will be handled separately in checkout
        discountDescription = 'Free shipping';
        break;
      default:
        discountAmount = 0;
        discountDescription = discount.description || 'Discount applied';
    }

    return NextResponse.json({
      valid: true,
      discount: {
        id: discount.id,
        code: discount.code,
        type: discount.type,
        value: discount.value,
        description: discountDescription,
        discountAmount: discountAmount,
      },
    });
  } catch (error) {
    console.error('Discount validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate discount code' },
      { status: 500 }
    );
  }
}
