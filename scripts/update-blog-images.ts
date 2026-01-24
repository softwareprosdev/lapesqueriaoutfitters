import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Blog post image updates for missing/incorrect images
const blogImageUpdates = [
  {
    slug: 'atlantic-bottlenose-dolphins',
    featuredImage: 'https://images.unsplash.com/photo-1570481662006-a3a1374699e8?w=800&h=600&fit=crop', // Dolphins
  },
  {
    slug: 'shark-week-gulf-mexico',
    featuredImage: 'https://images.unsplash.com/photo-1546592828-75d9c28be48?w=800&h=600&fit=crop', // Shark
  }
];

async function updateBlogImages() {
  try {
    console.log('🖼️ Updating blog post images...');

    for (const update of blogImageUpdates) {
      const existingPost = await prisma.blogPost.findUnique({
        where: { slug: update.slug }
      });

      if (existingPost && existingPost.featuredImage !== update.featuredImage) {
        await prisma.blogPost.update({
          where: { slug: update.slug },
          data: { featuredImage: update.featuredImage }
        });
        console.log(`✅ Updated image for: ${update.slug}`);
      } else {
        console.log(`ℹ️ Post ${update.slug} already has correct image or doesn't exist`);
      }
    }

    console.log('✨ Blog image updates completed.');
  } catch (error) {
    console.error('❌ Error updating blog images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update if this script is called directly
if (require.main === module) {
  updateBlogImages();
}

export { updateBlogImages };