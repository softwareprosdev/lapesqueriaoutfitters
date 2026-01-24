"use server";
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary from CLOUDINARY_URL or individual env vars
const getCloudinaryConfig = () => {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  
  if (cloudinaryUrl) {
    // Parse cloudinary://cloud_name:api_key:api_secret@cloud_name format
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

export async function uploadProductImage(formData: FormData) {
  try {
    if (!cloudConfig.cloud_name || cloudConfig.cloud_name === 'your-cloud-name') {
      console.error('Cloudinary is not configured');
      return { success: false, error: 'Image upload is not configured. Please configure Cloudinary in environment variables.' };
    }

    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];
    if (!validTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Only JPEG, PNG, WebP, GIF, and HEIC are allowed.' };
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return { success: false, error: 'File too large. Maximum size is 50MB.' };
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let processedBuffer: Buffer;
    try {
      processedBuffer = await sharp(buffer)
        .rotate()
        .webp({ quality: 90 })
        .resize(5000, 5000, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .toBuffer();
    } catch (sharpError) {
      console.error('Image processing error:', sharpError);
      return { success: false, error: 'Failed to process image. Please try a different image format.' };
    }

    try {
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
        uploadStream.end(processedBuffer);
      });

      return { 
        success: true, 
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id
      };
    } catch (cloudinaryError) {
      console.error('Cloudinary upload error:', cloudinaryError);
      return { success: false, error: 'Failed to upload to Cloudinary. Please check your connection and try again.' };
    }
  } catch (error) {
    console.error('Image upload error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to upload image' };
  }
}
