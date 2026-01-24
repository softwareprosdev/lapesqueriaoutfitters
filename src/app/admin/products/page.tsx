import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ProductsTable } from '@/components/admin/ProductsTable';

async function getProducts() {
  return await prisma.product.findMany({
    include: {
      category: true,
      variants: true,
      images: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export default async function ProductsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/admin/login');
  }

  const products = await getProducts();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ProductsTable initialProducts={products as any} />;
}
