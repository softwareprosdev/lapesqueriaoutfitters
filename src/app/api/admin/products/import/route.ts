import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseCSV, validateProductRows, groupProductsBySlug } from '@/lib/csv/product-parser';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read file content
    const csvText = await file.text();

    // Parse CSV
    const rows = parseCSV(csvText);

    // Validate rows
    const { valid, invalid } = validateProductRows(rows);

    if (invalid.length > 0) {
      return NextResponse.json(
        {
          error: 'Validation errors',
          invalid,
          validCount: valid.length,
        },
        { status: 400 }
      );
    }

    // Group by slug (products can have multiple variants in CSV)
    const productGroups = groupProductsBySlug(valid);

    const created: string[] = [];
    const errors: { slug: string; error: string }[] = [];

    // Create products with variants
    for (const [slug, productRows] of productGroups.entries()) {
      try {
        const mainRow = productRows[0];

        // Check if product already exists
        const existingProduct = await prisma.product.findUnique({
          where: { slug },
        });

        if (existingProduct) {
          errors.push({ slug, error: 'Product already exists' });
          continue;
        }

        // Find or create category
        let categoryId: string | null = null;
        if (mainRow.categorySlug) {
          const category = await prisma.category.findUnique({
            where: { slug: mainRow.categorySlug },
          });

          if (!category) {
            errors.push({ slug, error: `Category '${mainRow.categorySlug}' not found` });
            continue;
          }

          categoryId = category.id;
        }

        // Parse images
        const imageUrls = mainRow.images
          ? mainRow.images.split('|').map((url) => url.trim())
          : [];

        // Create product with variants
        const product = await prisma.product.create({
          data: {
            name: mainRow.name,
            slug: mainRow.slug,
            description: mainRow.description,
            sku: mainRow.slug, // Use slug as SKU for CSV import
            basePrice: mainRow.basePrice,
            images: {
              create: imageUrls.map((url, index) => ({
                url,
                alt: mainRow.name,
                position: index,
              })),
            },
            featured: mainRow.featured || false,
            conservationPercentage: mainRow.conservationPercentage || 10,
            conservationFocus: mainRow.conservationFocus,
            variants: {
              create: productRows.map((row, index) => ({
                name: row.variantName || `Default Variant ${index + 1}`,
                sku: row.variantSku || `${slug}-${index + 1}`,
                price: row.variantPrice || mainRow.basePrice,
                stock: row.variantStock || 0,
                size: row.variantSize,
                color: row.variantColor,
                material: row.variantMaterial,
                isDefault: index === 0,
              })),
            },
            ...(categoryId && {
              categories: {
                create: {
                  category: {
                    connect: { id: categoryId },
                  },
                },
              },
            }),
          },
        });

        created.push(product.slug);

        // Create inventory transactions for initial stock
        for (let i = 0; i < productRows.length; i++) {
          const row = productRows[i];
          if (row.variantStock && row.variantStock > 0) {
            const variant = await prisma.productVariant.findFirst({
              where: {
                productId: product.id,
                sku: row.variantSku || `${slug}-${i + 1}`,
              },
            });

            if (variant) {
              await prisma.inventoryTransaction.create({
                data: {
                  variantId: variant.id,
                  type: 'RESTOCK',
                  quantity: row.variantStock,
                  notes: 'Initial stock from CSV import',
                  userId: session.user.id,
                },
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error creating product ${slug}:`, error);
        errors.push({ slug, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    return NextResponse.json({
      success: true,
      created: created.length,
      failed: errors.length,
      createdProducts: created,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Failed to import products', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
