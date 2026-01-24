import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Helper to generate slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ============================================================================
// CATEGORIES CRUD
// ============================================================================

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'categories';

    if (type === 'categories') {
      const categories = await prisma.tShirtCategory.findMany({
        orderBy: { displayOrder: 'asc' },
        include: { _count: { select: { products: true } } }
      });
      return NextResponse.json({ categories });
    }

    if (type === 'colors') {
      const colors = await prisma.tShirtColor.findMany({
        orderBy: { displayOrder: 'asc' }
      });
      return NextResponse.json({ colors });
    }

    if (type === 'sizes') {
      const sizes = await prisma.tShirtSize.findMany({
        orderBy: { displayOrder: 'asc' }
      });
      return NextResponse.json({ sizes });
    }

    if (type === 'products') {
      const products = await prisma.tShirtProduct.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          inventory: {
            include: {
              color: true,
              size: true
            }
          }
        }
      });
      return NextResponse.json({ products });
    }

    if (type === 'inventory') {
      const inventory = await prisma.tShirtInventory.findMany({
        include: {
          product: true,
          color: true,
          size: true
        },
        orderBy: { updatedAt: 'desc' }
      });
      return NextResponse.json({ inventory });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

  } catch (error) {
    console.error('T-shirt inventory GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

// Create or Update operations
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { entity, action, data } = body;

    // Handle different entities
    switch (entity) {
      case 'category': {
        if (action === 'create') {
          const slug = data.slug || generateSlug(data.name);
          const category = await prisma.tShirtCategory.create({
            data: {
              name: data.name,
              slug,
              description: data.description,
              imageUrl: data.imageUrl,
              isActive: data.isActive ?? true,
              displayOrder: data.displayOrder ?? 0
            }
          });
          return NextResponse.json({ category, message: 'Category created' });
        }
        break;
      }

      case 'color': {
        if (action === 'create') {
          const color = await prisma.tShirtColor.create({
            data: {
              name: data.name,
              hexCode: data.hexCode,
              isActive: data.isActive ?? true,
              displayOrder: data.displayOrder ?? 0
            }
          });
          return NextResponse.json({ color, message: 'Color created' });
        }
        break;
      }

      case 'size': {
        if (action === 'create') {
          const size = await prisma.tShirtSize.create({
            data: {
              name: data.name,
              label: data.label,
              chestWidth: data.chestWidth,
              length: data.length,
              isActive: data.isActive ?? true,
              displayOrder: data.displayOrder ?? 0
            }
          });
          return NextResponse.json({ size, message: 'Size created' });
        }
        break;
      }

      case 'product': {
        if (action === 'create') {
          const slug = data.slug || generateSlug(data.name);
          
          // Create product first
          const product = await prisma.tShirtProduct.create({
            data: {
              name: data.name,
              slug,
              description: data.description,
              basePrice: data.basePrice,
              imageUrl: data.imageUrl,
              categoryId: data.categoryId,
              isActive: data.isActive ?? true
            }
          });

          // If variants are provided, create them
          if (data.variants && Array.isArray(data.variants)) {
            for (const variant of data.variants) {
              await prisma.tShirtInventory.create({
                data: {
                  productId: product.id,
                  colorId: variant.colorId,
                  sizeId: variant.sizeId,
                  stock: variant.stock ?? 0,
                  price: variant.price ?? data.basePrice,
                  sku: variant.sku,
                  reorderPoint: variant.reorderPoint ?? 10,
                  safetyStock: variant.safetyStock ?? 5
                }
              });
            }
          }

          return NextResponse.json({ product, message: 'Product created' });
        }

        // Add stock to existing variant
        if (action === 'addStock') {
          const { inventoryId, quantity, reason } = data;
          
          // Update stock
          const inventory = await prisma.tShirtInventory.update({
            where: { id: inventoryId },
            data: {
              stock: { increment: quantity },
              lastRestockAt: new Date()
            }
          });

          // Create transaction record
          await prisma.tShirtInventoryTransaction.create({
            data: {
              inventoryId,
              type: 'RESTOCK',
              quantity,
              reason
            }
          });

          return NextResponse.json({ inventory, message: 'Stock added' });
        }
        break;
      }

      case 'inventory': {
        if (action === 'create') {
          const inventory = await prisma.tShirtInventory.create({
            data: {
              productId: data.productId,
              colorId: data.colorId,
              sizeId: data.sizeId,
              stock: data.stock ?? 0,
              price: data.price ?? 0,
              sku: data.sku,
              reorderPoint: data.reorderPoint ?? 10,
              safetyStock: data.safetyStock ?? 5
            }
          });
          return NextResponse.json({ inventory, message: 'Inventory item created' });
        }

        if (action === 'adjust') {
          const { inventoryId, quantity, type, reason } = data;
          
          if (type === 'set') {
            // Set exact stock
            const inventory = await prisma.tShirtInventory.update({
              where: { id: inventoryId },
              data: { stock: quantity }
            });

            await prisma.tShirtInventoryTransaction.create({
              data: {
                inventoryId,
                type: 'ADJUSTMENT',
                quantity,
                reason: reason || 'Manual adjustment'
              }
            });

            return NextResponse.json({ inventory, message: 'Stock adjusted' });
          } else if (type === 'add') {
            // Add to stock
            const inventory = await prisma.tShirtInventory.update({
              where: { id: inventoryId },
              data: {
                stock: { increment: quantity },
                lastRestockAt: new Date()
              }
            });

            await prisma.tShirtInventoryTransaction.create({
              data: {
                inventoryId,
                type: 'RESTOCK',
                quantity,
                reason: reason || 'Restock'
              }
            });

            return NextResponse.json({ inventory, message: 'Stock added' });
          } else if (type === 'subtract') {
            // Subtract from stock
            const inventory = await prisma.tShirtInventory.update({
              where: { id: inventoryId },
              data: {
                stock: { decrement: quantity },
                lastSaleAt: new Date()
              }
            });

            await prisma.tShirtInventoryTransaction.create({
              data: {
                inventoryId,
                type: 'SALE',
                quantity: -quantity,
                reason: reason || 'Sale'
              }
            });

            return NextResponse.json({ inventory, message: 'Stock reduced' });
          }
          break;
        }
      }
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  } catch (error) {
    console.error('T-shirt inventory POST error:', error);
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}

// Update operations
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { entity, id, data } = body;

    switch (entity) {
      case 'category': {
        const category = await prisma.tShirtCategory.update({
          where: { id },
          data: {
            name: data.name,
            slug: data.slug,
            description: data.description,
            imageUrl: data.imageUrl,
            isActive: data.isActive,
            displayOrder: data.displayOrder
          }
        });
        return NextResponse.json({ category, message: 'Category updated' });
      }

      case 'color': {
        const color = await prisma.tShirtColor.update({
          where: { id },
          data: {
            name: data.name,
            hexCode: data.hexCode,
            isActive: data.isActive,
            displayOrder: data.displayOrder
          }
        });
        return NextResponse.json({ color, message: 'Color updated' });
      }

      case 'size': {
        const size = await prisma.tShirtSize.update({
          where: { id },
          data: {
            name: data.name,
            label: data.label,
            chestWidth: data.chestWidth,
            length: data.length,
            isActive: data.isActive,
            displayOrder: data.displayOrder
          }
        });
        return NextResponse.json({ size, message: 'Size updated' });
      }

      case 'product': {
        const product = await prisma.tShirtProduct.update({
          where: { id },
          data: {
            name: data.name,
            slug: data.slug,
            description: data.description,
            basePrice: data.basePrice,
            imageUrl: data.imageUrl,
            categoryId: data.categoryId,
            isActive: data.isActive
          }
        });
        return NextResponse.json({ product, message: 'Product updated' });
      }

      case 'inventory': {
        const inventory = await prisma.tShirtInventory.update({
          where: { id },
          data: {
            colorId: data.colorId,
            sizeId: data.sizeId,
            stock: data.stock,
            price: data.price,
            sku: data.sku,
            reorderPoint: data.reorderPoint,
            safetyStock: data.safetyStock
          }
        });
        return NextResponse.json({ inventory, message: 'Inventory updated' });
      }
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  } catch (error) {
    console.error('T-shirt inventory PATCH error:', error);
    return NextResponse.json(
      { error: 'Update failed' },
      { status: 500 }
    );
  }
}

// Delete operations
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const entity = searchParams.get('entity');
    const id = searchParams.get('id');

    if (!entity || !id) {
      return NextResponse.json({ error: 'Missing entity or id' }, { status: 400 });
    }

    switch (entity) {
      case 'category': {
        await prisma.tShirtCategory.delete({ where: { id } });
        return NextResponse.json({ message: 'Category deleted' });
      }

      case 'color': {
        await prisma.tShirtColor.delete({ where: { id } });
        return NextResponse.json({ message: 'Color deleted' });
      }

      case 'size': {
        await prisma.tShirtSize.delete({ where: { id } });
        return NextResponse.json({ message: 'Size deleted' });
      }

      case 'product': {
        await prisma.tShirtProduct.delete({ where: { id } });
        return NextResponse.json({ message: 'Product deleted' });
      }

      case 'inventory': {
        await prisma.tShirtInventory.delete({ where: { id } });
        return NextResponse.json({ message: 'Inventory item deleted' });
      }
    }

    return NextResponse.json({ error: 'Invalid entity' }, { status: 400 });

  } catch (error) {
    console.error('T-shirt inventory DELETE error:', error);
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    );
  }
}
