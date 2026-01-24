import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH - Update SEO settings, redirect, or sitemap entry
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
    const { type, ...data } = body;

    if (type === 'settings') {
      const settings = await prisma.sEOSettings.update({
        where: { id },
        data,
      });
      return NextResponse.json({ success: true, settings });
    }

    if (type === 'redirect') {
      const redirect = await prisma.redirect.update({
        where: { id },
        data,
      });
      return NextResponse.json({ success: true, redirect });
    }

    if (type === 'sitemap') {
      const entry = await prisma.sitemapEntry.update({
        where: { id },
        data,
      });
      return NextResponse.json({ success: true, entry });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    console.error('Update SEO data error:', error);
    return NextResponse.json(
      { error: 'Failed to update SEO data' },
      { status: 500 }
    );
  }
}

// DELETE - Delete SEO settings, redirect, or sitemap entry
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
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'settings') {
      await prisma.sEOSettings.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (type === 'redirect') {
      await prisma.redirect.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (type === 'sitemap') {
      await prisma.sitemapEntry.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    console.error('Delete SEO data error:', error);
    return NextResponse.json(
      { error: 'Failed to delete SEO data' },
      { status: 500 }
    );
  }
}
