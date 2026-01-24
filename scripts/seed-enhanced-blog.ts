import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Actual blog posts with proper content and images from database
const blogPosts = [
  {
    title: 'Atlantic Bottlenose Dolphins: Intelligence in the Waves',
    slug: 'atlantic-bottlenose-dolphins-enhanced',
    excerpt: 'Experience the remarkable intelligence and social complexity of Atlantic Bottlenose Dolphins in Gulf of Mexico, featuring interactive research stations, behavioral studies, and conservation updates from South Padre Island researchers.',
    image: 'https://images.unsplash.com/photo-1570481662006-a3a1374699e8?w=800&h=600&fit=crop',
    category: 'Marine Research',
    featured: true,
    published: true,
    publishedAt: new Date('2025-01-10'),
    content: `
      <h2>Minds Beneath the Surface</h2>
      <p>Deep beneath the Gulf of Mexico's crystalline waters, some of the most intelligent minds in the animal kingdom navigate complex social networks, solve problems, and even recognize themselves in mirrors. Atlantic Bottlenose Dolphins (Tursiops truncatus) represent one of nature's most fascinating cognitive achievements—minds that evolved separately from our own yet developed capabilities that continue to surprise scientists.</p>
      
      <p>The waters surrounding South Padre Island and the Laguna Madre teem with these charismatic marine mammals. Resident pods have established territories they patrol daily, following established routes between feeding grounds and resting areas. Transient dolphins cover vast distances along the Gulf coast, sometimes traveling hundreds of miles in their seasonal migrations. Both groups display remarkable adaptability to the ever-changing marine environment.</p>
      
      <h3>The Language of the Deep</h3>
      <p>Dolphin communication goes far beyond the clicks and whistles that captivate human observers. These marine linguists employ a complex system of signature whistles, body language, and burst-pulse sounds that can convey specific information about prey, predators, or social opportunities. Each individual develops a unique signature whistle within its first year, much like humans develop their voices.</p>
      
      <p>Research conducted at the Dolphin Research Center in nearby Galveston has revealed astonishing cognitive abilities. Dolphins demonstrate self-awareness through mirror tests, understand abstract concepts like "none" versus "more," and can follow complex multi-step instructions. Their problem-solving skills rival those of great apes, with individuals showing creativity in using tools and cooperation to achieve goals.</p>
      
      <h3>Research Stations & Conservation</h3>
      <p>South Padre Island has established several dolphin research and conservation stations where visitors can observe these magnificent creatures in their natural habitat. These facilities conduct ongoing behavioral studies, population monitoring, and health assessments. Researchers use photo identification to track individual dolphins over decades, creating comprehensive understanding of their social structures and life histories.</p>
      
      <p>Conservation efforts focus on protecting critical habitats, reducing bycatch in fishing operations, and educating the public about the importance of these intelligent marine mammals. The dolphins of the Gulf face threats from habitat degradation, pollution, and human disturbance, making these research and conservation efforts increasingly crucial for their survival.</p>
      
      <h3>A Living Ocean Laboratory</h3>
      <p>For visitors and researchers, the opportunity to observe dolphins in their natural environment provides invaluable insights into marine intelligence and social behavior. Whether you're watching from a boat tour or participating in a research program, encountering these remarkable creatures offers a glimpse into the complexity and beauty of ocean life.</p>
      
      <p>The next time you spot a dolphin leaping in the waves or playing in the wake of your boat, remember that you're witnessing not just an animal, but a sentient being with a rich social life, problem-solving abilities, and a personality that has evolved over millions of years of adaptation to marine environments.</p>
    `
  }
];

async function seedEnhancedBlogPosts() {
  try {
    console.log('🌊 Seeding enhanced blog posts...');

    // Check if enhanced posts already exist
    const existingPosts = await prisma.blogPost.count();
    
    if (existingPosts > 0) {
      console.log(`✅ Found ${existingPosts} blog posts already in database. Skipping seeding.`);
      return;
    }

    console.log('📝 Creating enhanced blog posts...');

    // Get first user to assign as author (usually admin)
    const author = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    });

    if (!author) {
      console.error('❌ No admin user found. Please seed users first.');
      return;
    }

    for (const post of blogPosts) {
      const existingPost = await prisma.blogPost.findUnique({
        where: { slug: post.slug }
      });

      if (!existingPost) {
        await prisma.blogPost.create({
          data: {
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            featuredImage: post.image,
            category: post.category,
            featured: post.featured,
            published: post.published,
            publishedAt: post.publishedAt,
            authorId: author.id
          }
        });
        console.log(`✅ Created enhanced post: ${post.title}`);
      } else {
        console.log(`⏭️ Enhanced post already exists: ${post.title}`);
      }
    }

    console.log('✨ Enhanced blog seeding completed.');
  } catch (error) {
    console.error('❌ Error seeding enhanced blog posts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding if script is called directly
if (require.main === module) {
  seedEnhancedBlogPosts();
}

export { seedEnhancedBlogPosts };