import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createTShirtSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  basePrice: z.number().positive('Price must be positive'),
  category: z.string().default('t-shirts'),
  conservationPercentage: z.number().min(0).max(100).default(10),
  conservationFocus: z.string().optional(),
  imageUrl: z.string().optional(),
  variants: z.array(z.object({
    size: z.string(),
    color: z.string(),
    stock: z.number().int().min(0).default(0),
    price: z.number().positive(),
    sku: z.string(),
    material: z.string().optional(),
  })).min(1, 'At least one variant is required'),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createTShirtSchema.parse(body);

    // Get or create category
    let category = await prisma.category.findFirst({
      where: { slug: validated.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: validated.category,
          slug: validated.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: `${validated.category} products`,
        }
      });
    }

    // Generate product slug
    const slug = validated.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Check for existing product with same slug
    const existing = await prisma.product.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug;

    // Generate product SKU prefix
    const productSkuPrefix = `TSHIRT-${Date.now().toString(36).toUpperCase()}`;

    // Create product with variants
    const product = await prisma.product.create({
      data: {
        name: validated.name,
        slug: finalSlug,
        description: validated.description,
        sku: productSkuPrefix,
        basePrice: validated.basePrice,
        conservationPercentage: validated.conservationPercentage,
        conservationFocus: validated.conservationFocus,
        categoryId: category.id,
        isCustomizable: false,
        variants: {
          create: validated.variants.map(v => ({
            name: `${validated.name} - ${v.color} / ${v.size}`,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
            size: v.size,
            color: v.color,
            material: v.material || '100% Organic Cotton',
          }))
        },
        images: validated.imageUrl ? {
          create: {
            url: validated.imageUrl,
            alt: `${validated.name} product image`,
            position: 0,
          }
        } : undefined,
      },
      include: {
        variants: true,
        images: true,
      }
    });

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        variants: product.variants.length,
      }
    });
  } catch (error) {
    console.error('Create t-shirt error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create t-shirt product' },
      { status: 500 }
    );
  }
}
