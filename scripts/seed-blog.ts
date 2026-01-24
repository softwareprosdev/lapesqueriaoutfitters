import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedBlogPosts() {
  try {
    console.log('🌊 Checking if blog posts need to be seeded...');

    // Check if blog posts already exist
    const existingPosts = await prisma.blogPost.count();
    
    if (existingPosts > 0) {
      console.log(`✅ Found ${existingPosts} blog posts already in database. Skipping seeding.`);
      return;
    }

    console.log('📝 No blog posts found. Starting to seed blog posts...');

    // Unique ocean/conservation images for blog posts
    const blogImages = {
      seaTurtle: 'https://images.unsplash.com/photo-1591025207163-942350e47db2?w=800&h=600&fit=crop', // Sea turtle swimming
      dolphin: 'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?w=800&h=600&fit=crop', // Dolphins jumping (Pagie Page)
      pelican: 'https://images.unsplash.com/photo-1601247387326-f8bcb5a234d4?w=800&h=600&fit=crop', // Brown pelican
      laguna: 'https://images.unsplash.com/photo-1507525428034-b723df0612b?w=800&h=600&fit=crop', // Coastal lagoon
      mantaRay: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop', // Manta ray
      coralReef: 'https://images.unsplash.com/photo-1546026423-875d9c28be48?w=800&h=600&fit=crop', // Coral reef
      coastalBirds: 'https://images.unsplash.com/photo-1555169062-013468b47731?w=800&h=600&fit=crop', // Coastal birds
      whoopingCrane: 'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?w=800&h=600&fit=crop', // White crane
    }

    const blogPosts = [
      {
        title: 'Protecting Sea Turtles: Our Partnership with Sea Turtle Inc.',
        slug: 'sea-turtle-inc-partnership',
        excerpt: "Discover how Shenna's Studio supports Sea Turtle Inc., a world-renowned sea turtle rescue and rehabilitation center in South Padre Island, Texas, and learn about critical conservation work protecting five endangered species.",
        image: blogImages.seaTurtle,
        category: 'Conservation',
        featured: true,
        published: true,
        publishedAt: new Date('2025-01-15'),
        content: `
          <h2>About Sea Turtle Inc.</h2>
          <p>For over 45 years, Sea Turtle Inc. has stood as a beacon of hope for endangered sea turtles along the Texas Gulf Coast. Located on South Padre Island, this non-profit organization has rescued, rehabilitated, and released thousands of sea turtles back into the wild. What began as a grassroots effort by local conservationist Ila Loetscher, affectionately known as the "Turtle Lady of South Padre Island," has evolved into a world-class facility that serves as a model for marine conservation efforts globally.</p>
          
          <p>The facility operates 24/7, responding to emergency calls about stranded turtles along the coast. Their dedicated team of veterinarians, biologists, and volunteers work tirelessly to provide medical care, rehabilitation, and eventual release for injured and sick sea turtles. The center also houses permanent resident turtles who cannot be released due to their injuries, serving as ambassadors for their species and educating thousands of visitors annually about the importance of ocean conservation.</p>
          
          <h3>Five Species, One Mission</h3>
          <p>The waters surrounding South Padre Island are home to five of the world's seven sea turtle species: the critically endangered Kemp's Ridley, Green sea turtles, Loggerheads, Hawksbills, and the occasional Leatherback. Each species faces unique challenges, from habitat loss and pollution to boat strikes and fishing gear entanglement. Sea Turtle Inc. treats them all with specialized care tailored to each species' needs.</p>
          
          <p>The Kemp's Ridley sea turtle holds a special place in the hearts of South Texas conservationists. As the smallest and most endangered sea turtle species in the world, with South Padre Island being one of only two primary nesting locations globally, every single individual counts. In the 1940s, an estimated 40,000 Kemp's Ridleys nested on a single day at Rancho Nuevo, Mexico. By the 1980s, that number had plummeted to just a few hundred nests per year. Thanks to intensive conservation efforts, including those led by Sea Turtle Inc., the population is slowly recovering, but they remain critically endangered.</p>
          
          <h3>How Shenna's Studio Makes a Difference</h3>
          <p>With every handcrafted bracelet you purchase from Shenna's Studio, 10% of the sale goes directly to Sea Turtle Inc. This partnership is at the heart of our mission to combine beautiful artisan jewelry with meaningful ocean conservation. Your support funds:</p>
          
          <ul>
            <li><strong>Emergency Rescue Operations:</strong> Rapid response teams that rescue stranded turtles along the 34-mile stretch of South Padre Island and surrounding areas</li>
            <li><strong>Medical Treatment:</strong> State-of-the-art veterinary care including surgery, antibiotics, fluid therapy, and treatment for conditions like fibropapillomatosis, a debilitating tumor-causing disease</li>
            <li><strong>Rehabilitation Facilities:</strong> Specialized tanks and equipment to care for turtles during their recovery, which can take months or even years</li>
            <li><strong>Educational Programs:</strong> Free public education programs that reach over 100,000 visitors annually, teaching the next generation about marine conservation</li>
            <li><strong>Research Initiatives:</strong> Scientific studies on sea turtle health, behavior, and population dynamics that inform conservation strategies worldwide</li>
            <li><strong>Nesting Protection:</strong> Beach patrols during nesting season to protect vulnerable nests from predators and human interference</li>
            <li><strong>Release Programs:</strong> Carefully planned release events that return healthy turtles to the Gulf of Mexico with satellite tracking to monitor their progress</li>
          </ul>
          
          <h3>The Threats They Face</h3>
          <p>Despite decades of conservation work, sea turtles continue to face numerous threats. Climate change is altering beach temperatures, which determines the sex of hatchlings—warmer sand produces more females, potentially skewing population ratios. Plastic pollution is a deadly hazard; turtles mistake plastic bags for jellyfish, their favorite food, leading to intestinal blockages and starvation. Fishing gear entanglement causes injuries and drownings. Boat strikes result in severe shell fractures and internal injuries. Coastal development destroys nesting beaches, and artificial lighting disorients hatchlings trying to find the ocean.</p>
          
          <p>Sea Turtle Inc. addresses these threats through both direct intervention and public education. They work with local fishermen to promote turtle-friendly practices, coordinate with beach management to reduce light pollution during nesting season, and advocate for stronger protections of critical habitats.</p>
          
          <h3>Why Sea Turtles Matter</h3>
          <p>Sea turtles are keystone species that play crucial roles in maintaining healthy ocean ecosystems. Green sea turtles graze on seagrass beds, keeping them healthy and productive—similar to how lawn mowing prevents overgrowth. This grazing supports seagrass biodiversity and provides habitat for countless other species, from tiny invertebrates to juvenile fish. Hawksbills control sponge populations on coral reefs, preventing sponges from outcompeting corals for space. All sea turtles transport nutrients from the ocean to beaches through their eggs and nesting activities, supporting beach vegetation and dune systems.</p>
          
          <p>The loss of sea turtles would trigger cascading effects throughout marine ecosystems, impacting fish populations, coral reefs, and seagrass beds that humans depend on for food, coastal protection, and tourism revenue.</p>
          
          <h3>Success Stories That Inspire</h3>
          <p>Sea Turtle Inc. has countless success stories, but each one represents hope for the species. Turtles like Gerry, a Green sea turtle who recovered from severe injuries after being hit by a boat propeller, and Kemp, a Kemp's Ridley who overcame cold-stunning and pneumonia, have returned to the wild thanks to the dedicated care they received. These releases are celebrated by the community, often with hundreds of supporters lining the beach to witness these magnificent creatures paddle back into the waves.</p>
          
          <h3>Join the Movement</h3>
          <p>When you wear a Shenna's Studio bracelet, you become part of a larger movement to protect our oceans. You're supporting not just Sea Turtle Inc., but the entire ecosystem that depends on healthy sea turtle populations. You're investing in education that inspires children to become future conservationists. You're funding the rescue of a turtle that might otherwise die on a beach. You're making a tangible difference in the fight to save these ancient mariners that have swum our oceans for over 100 million years.</p>
          
          <p>Together, we're ensuring that future generations will be able to witness the miracle of sea turtles nesting on our beaches and swimming in our seas. Every bracelet tells a story—not just of beautiful craftsmanship, but of hope, recovery, and an enduring commitment to protect the creatures that call the Gulf of Mexico home.</p>
          
          <p><em>Visit Sea Turtle Inc. at 6617 Padre Blvd, South Padre Island, TX 78597. Open daily for educational tours and turtle viewings. Learn more at seaturtleinc.org</em></p>
        `
      }
    ];

    // Get first user to assign as author (usually admin)
    const author = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    });

    if (!author) {
      console.error('❌ No admin user found. Please seed users first.');
      process.exit(1);
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
        console.log(`✅ Created post: ${post.title}`);
      } else {
        // Update existing post with new image if different
        if (existingPost.featuredImage !== post.image) {
          await prisma.blogPost.update({
            where: { slug: post.slug },
            data: { featuredImage: post.image }
          });
          console.log(`🔄 Updated image for: ${post.title}`);
        } else {
          console.log(`⏭️ Post already exists with correct image: ${post.title}`);
        }
      }
    }

    console.log('✨ Blog seeding completed.');
  } catch (error) {
    console.error('❌ Error seeding blog posts:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding if script is called directly
if (require.main === module) {
  seedBlogPosts();
}