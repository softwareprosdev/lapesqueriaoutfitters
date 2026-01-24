import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const seoSettingsSchema = z.object({
  pageType: z.string(),
  pageId: z.string().optional().nullable(),
  slug: z.string().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  canonicalUrl: z.string().optional().nullable(),
  ogTitle: z.string().optional().nullable(),
  ogDescription: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  ogType: z.string().optional().nullable(),
  twitterCard: z.string().optional().nullable(),
  twitterTitle: z.string().optional().nullable(),
  twitterDescription: z.string().optional().nullable(),
  twitterImage: z.string().optional().nullable(),
  structuredData: z.string().optional().nullable(),
  noIndex: z.boolean().optional(),
  noFollow: z.boolean().optional(),
});

const redirectSchema = z.object({
  fromPath: z.string().min(1, 'From path is required'),
  toPath: z.string().min(1, 'To path is required'),
  statusCode: z.number().optional().default(301),
  isActive: z.boolean().optional().default(true),
});

// GET - Fetch SEO settings and redirects
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'settings'; // settings, redirects, sitemap
    const pageType = searchParams.get('pageType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (type === 'settings') {
      const where: Record<string, unknown> = {};
      if (pageType) {
        where.pageType = pageType;
      }

      const [settings, total] = await Promise.all([
        prisma.sEOSettings.findMany({
          where,
          orderBy: { updatedAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.sEOSettings.count({ where }),
      ]);

      // Get page counts by type
      const pageCounts = await prisma.sEOSettings.groupBy({
        by: ['pageType'],
        _count: true,
      });

      return NextResponse.json({
        settings,
        stats: {
          total,
          byType: pageCounts.reduce((acc, item) => {
            acc[item.pageType] = item._count;
            return acc;
          }, {} as Record<string, number>),
        },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    if (type === 'redirects') {
      const [redirects, total] = await Promise.all([
        prisma.redirect.findMany({
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.redirect.count(),
      ]);

      const activeCount = await prisma.redirect.count({ where: { isActive: true } });
      const totalHits = await prisma.redirect.aggregate({ _sum: { hitCount: true } });

      return NextResponse.json({
        redirects,
        stats: {
          total,
          active: activeCount,
          totalHits: totalHits._sum.hitCount || 0,
        },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    if (type === 'sitemap') {
      const [entries, total] = await Promise.all([
        prisma.sitemapEntry.findMany({
          orderBy: { priority: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.sitemapEntry.count(),
      ]);

      const activeCount = await prisma.sitemapEntry.count({ where: { isActive: true } });

      return NextResponse.json({
        entries,
        stats: {
          total,
          active: activeCount,
        },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    console.error('Fetch SEO data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SEO data' },
      { status: 500 }
    );
  }
}

// POST - Create SEO settings or redirect
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, ...data } = body;

    if (type === 'settings') {
      const validated = seoSettingsSchema.parse(data);

      // Check if settings already exist for this page
      const existing = await prisma.sEOSettings.findFirst({
        where: {
          pageType: validated.pageType,
          pageId: validated.pageId || null,
        },
      });

      if (existing) {
        // Update existing
        const settings = await prisma.sEOSettings.update({
          where: { id: existing.id },
          data: validated,
        });
        return NextResponse.json({ success: true, settings });
      }

      // Create new
      const settings = await prisma.sEOSettings.create({
        data: validated,
      });

      return NextResponse.json({ success: true, settings });
    }

    if (type === 'redirect') {
      const validated = redirectSchema.parse(data);

      // Check for duplicate
      const existing = await prisma.redirect.findUnique({
        where: { fromPath: validated.fromPath },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Redirect from this path already exists' },
          { status: 400 }
        );
      }

      const redirect = await prisma.redirect.create({
        data: validated,
      });

      return NextResponse.json({ success: true, redirect });
    }

    if (type === 'sitemap') {
      const { url, changeFreq, priority, isActive } = data;

      const existing = await prisma.sitemapEntry.findUnique({
        where: { url },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Sitemap entry for this URL already exists' },
          { status: 400 }
        );
      }

      const entry = await prisma.sitemapEntry.create({
        data: {
          url,
          changeFreq: changeFreq || 'weekly',
          priority: priority || 0.5,
          isActive: isActive ?? true,
        },
      });

      return NextResponse.json({ success: true, entry });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    console.error('Create SEO data error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create SEO data' },
      { status: 500 }
    );
  }
}
