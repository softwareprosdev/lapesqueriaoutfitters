import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    // Fetch data based on type
    if (type === 'orders') {
      const orders = await prisma.order.findMany({
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    select: { name: true },
                  },
                },
              },
            },
          },
          user: {
            select: { email: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Add indicators for potential dummy data
      const ordersWithFlags = orders.map((order) => ({
        ...order,
        flags: {
          hasRealPayment: !!order.stripePaymentId && !order.stripePaymentId.startsWith('test_'),
          hasValidEmail: !order.customerEmail.includes('test') &&
                         !order.customerEmail.includes('example') &&
                         !order.customerEmail.includes('fake'),
          hasValidAddress: order.shippingAddress &&
                          order.shippingAddress.length > 10 &&
                          !order.shippingAddress.toLowerCase().includes('test'),
          hasItems: order.items.length > 0,
          isLikelyReal: false, // Will be calculated below
        },
      }));

      // Calculate if order is likely real
      ordersWithFlags.forEach((order) => {
        const score =
          (order.flags.hasRealPayment ? 3 : 0) +
          (order.flags.hasValidEmail ? 2 : 0) +
          (order.flags.hasValidAddress ? 2 : 0) +
          (order.flags.hasItems ? 1 : 0);
        order.flags.isLikelyReal = score >= 5;
      });

      return NextResponse.json({ orders: ordersWithFlags });
    }

    if (type === 'products') {
      const products = await prisma.product.findMany({
        include: {
          variants: true,
          images: true,
          category: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      const productsWithFlags = products.map((product) => ({
        ...product,
        flags: {
          hasImages: product.images.length > 0,
          hasVariants: product.variants.length > 0,
          hasValidPrice: product.basePrice > 0,
          hasDescription: !!product.description && product.description.length > 20,
          isLikelyReal: false,
        },
      }));

      productsWithFlags.forEach((product) => {
        const score =
          (product.flags.hasImages ? 2 : 0) +
          (product.flags.hasVariants ? 2 : 0) +
          (product.flags.hasValidPrice ? 1 : 0) +
          (product.flags.hasDescription ? 1 : 0);
        product.flags.isLikelyReal = score >= 4;
      });

      return NextResponse.json({ products: productsWithFlags });
    }

    if (type === 'customers') {
      const customers = await prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        include: {
          orders: {
            select: { id: true, total: true },
          },
          rewards: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      const customersWithFlags = customers.map((customer) => ({
        ...customer,
        password: undefined, // Don't expose password
        flags: {
          hasOrders: customer.orders.length > 0,
          hasValidEmail: !customer.email.includes('test') &&
                        !customer.email.includes('example') &&
                        !customer.email.includes('fake'),
          hasName: !!customer.name && customer.name.length > 2,
          isLikelyReal: false,
        },
      }));

      customersWithFlags.forEach((customer) => {
        const score =
          (customer.flags.hasOrders ? 3 : 0) +
          (customer.flags.hasValidEmail ? 2 : 0) +
          (customer.flags.hasName ? 1 : 0);
        customer.flags.isLikelyReal = score >= 4;
      });

      return NextResponse.json({ customers: customersWithFlags });
    }

    if (type === 'blog') {
      const posts = await prisma.blogPost.findMany({
        include: {
          author: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ posts });
    }

    if (type === 'categories') {
      const categories = await prisma.category.findMany({
        include: {
          _count: {
            select: { products: true },
          },
        },
        orderBy: { name: 'asc' },
      });

      return NextResponse.json({ categories });
    }

    // Default: return summary counts
    const [
      orderCount,
      productCount,
      customerCount,
      categoryCount,
      blogCount,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.category.count(),
      prisma.blogPost.count(),
    ]);

    return NextResponse.json({
      summary: {
        orders: orderCount,
        products: productCount,
        customers: customerCount,
        categories: categoryCount,
        blogPosts: blogCount,
      },
    });
  } catch (error) {
    console.error('Data cleanup fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, ids } = body;

    if (!type || !ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request. Provide type and ids array.' },
        { status: 400 }
      );
    }

    let deletedCount = 0;

    switch (type) {
      case 'orders':
        const deleteOrders = await prisma.order.deleteMany({
          where: { id: { in: ids } },
        });
        deletedCount = deleteOrders.count;
        break;

      case 'products':
        const deleteProducts = await prisma.product.deleteMany({
          where: { id: { in: ids } },
        });
        deletedCount = deleteProducts.count;
        break;

      case 'customers':
        const deleteCustomers = await prisma.user.deleteMany({
          where: {
            id: { in: ids },
            role: 'CUSTOMER', // Safety: only delete customers, not admins
          },
        });
        deletedCount = deleteCustomers.count;
        break;

      case 'blog':
        const deletePosts = await prisma.blogPost.deleteMany({
          where: { id: { in: ids } },
        });
        deletedCount = deletePosts.count;
        break;

      case 'categories':
        // Check if any products are using these categories
        const productsUsingCategories = await prisma.product.count({
          where: { categoryId: { in: ids } },
        });

        if (productsUsingCategories > 0) {
          return NextResponse.json(
            { error: `Cannot delete categories that have ${productsUsingCategories} product(s) assigned.` },
            { status: 400 }
          );
        }

        const deleteCategories = await prisma.category.deleteMany({
          where: { id: { in: ids } },
        });
        deletedCount = deleteCategories.count;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `Successfully deleted ${deletedCount} ${type}`,
    });
  } catch (error) {
    console.error('Data cleanup delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete data' },
      { status: 500 }
    );
  }
}
