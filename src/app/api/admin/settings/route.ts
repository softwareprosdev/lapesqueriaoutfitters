import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    // GET is public so the logo can be displayed on the website
    // No authentication required for reading settings

    // Get the first (and should be only) settings record
    let settings = await prisma.siteSettings.findFirst();

    // If no settings exist, create default settings
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          siteName: "La Pesqueria's Studio",
          primaryColor: '#3B82F6',
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error: unknown) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.siteName || !data.primaryColor) {
      return NextResponse.json(
        { error: 'Site name and primary color are required' },
        { status: 400 }
      );
    }

    // Check if settings exist
    const existing = await prisma.siteSettings.findFirst();

    let settings;
    if (existing) {
      // Update existing settings
      settings = await prisma.siteSettings.update({
        where: { id: existing.id },
        data: {
          siteName: data.siteName,
          logo: data.logo || null,
          tagline: data.tagline || null,
          primaryColor: data.primaryColor,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address || null,
          facebook: data.facebook || null,
          instagram: data.instagram || null,
          twitter: data.twitter || null,
        },
      });
    } else {
      // Create new settings
      settings = await prisma.siteSettings.create({
        data: {
          siteName: data.siteName,
          logo: data.logo || null,
          tagline: data.tagline || null,
          primaryColor: data.primaryColor,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address || null,
          facebook: data.facebook || null,
          instagram: data.instagram || null,
          twitter: data.twitter || null,
        },
      });
    }

    // Revalidate all pages to update logo and site name
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, settings });
  } catch (error: unknown) {
    console.error('Error saving settings:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (error && typeof error === 'object') {
      console.error('Error details:', {
        name: 'name' in error ? error.name : undefined,
        message: errorMessage,
        code: 'code' in error ? error.code : undefined,
        meta: 'meta' in error ? error.meta : undefined,
      });
    }

    return NextResponse.json(
      {
        error: errorMessage || 'Failed to save settings',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
