import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary from CLOUDINARY_URL or individual env vars
const getCloudinaryConfig = () => {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;

  if (cloudinaryUrl) {
    // Parse cloudinary://api_key:api_secret@cloud_name format
    const match = cloudinaryUrl.match(/cloudinary:\/\/(?:([^:]+):([^@]+)@)?(.+)/);
    if (match) {
      return {
        cloud_name: match[3],
        api_key: match[1] || '',
        api_secret: match[2] || '',
      };
    }
  }

  return {
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  };
};

const cloudConfig = getCloudinaryConfig();
cloudinary.config(cloudConfig);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!cloudConfig.cloud_name || cloudConfig.cloud_name === 'your-cloud-name') {
      return NextResponse.json(
        { error: 'Image upload is not configured. Please configure Cloudinary in environment variables.' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type (including HEIC/HEIF for iPhone photos)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, GIF, and HEIC are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB for 4K photos)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Convert to WebP and compress for SEO optimization
    // Quality 90 preserves detail for high-res iPhone photos
    // 5000x5000 max supports iPhone 17 Pro Max resolution
    const compressedBuffer = await sharp(buffer)
      .rotate() // Auto-rotate based on EXIF orientation
      .webp({ quality: 90 })
      .resize(5000, 5000, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toBuffer();

    // Upload to Cloudinary
    const uploadResult = await new Promise<{ public_id: string; secure_url: string; width: number; height: number }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'lapesqueria/products',
          resource_type: 'image',
          transformation: [
            { quality: 'auto:best', fetch_format: 'auto' }
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result!);
        }
      );
      uploadStream.end(compressedBuffer);
    });

    return NextResponse.json({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      originalSize: file.size,
      type: 'image/webp',
    });
  } catch (error: unknown) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) || 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Get upload size limit
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};
