import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Realistic US-based reviews (Texas and beyond)
const reviews = [
  // Texas
  { author: "Sarah M.", location: "Austin, TX", text: "Absolutely stunning! The Ocean Wave bracelet reminds me of our trip to SPI. The quality is incredible.", rating: 5 },
  { author: "James R.", location: "Houston, TX", text: "Bought this as a gift for my wife and she hasn't taken it off. Love that it supports conservation too!", rating: 5 },
  { author: "Emily K.", location: "Dallas, TX", text: "The detail on the Sea Turtle charm is amazing. Fast shipping to Dallas. Will definitely order again.", rating: 5 },
  { author: "Michael B.", location: "San Antonio, TX", text: "Great craftsmanship. It feels very durable but looks elegant. Highly recommend.", rating: 5 },
  { author: "Jessica L.", location: "Corpus Christi, TX", text: "Living on the coast, I love anything ocean-themed. These are by far the best bead bracelets I've found.", rating: 5 },
  { author: "David W.", location: "Fort Worth, TX", text: "The colors are so vibrant, exactly like the photos. Customer service was also very helpful.", rating: 5 },
  { author: "Amanda G.", location: "El Paso, TX", text: "Beautiful packaging and a beautiful cause. I love wearing my support for sea turtles.", rating: 5 },
  { author: "Robert P.", location: "Arlington, TX", text: "My daughter loves her new bracelet. It fits perfectly and the clasp is secure.", rating: 5 },
  { author: "Jennifer S.", location: "Plano, TX", text: "I've received so many compliments on my Coral Reef bracelet. It really sparkles in the sun.", rating: 5 },
  { author: "Christopher D.", location: "Lubbock, TX", text: "High quality beads and a sturdy string. It's survived daily wear for a month now with no issues.", rating: 5 },
  { author: "Ashley T.", location: "Laredo, TX", text: "The Whale Song bracelet is just gorgeous. I love the blue hues. Very calming.", rating: 5 },
  { author: "Matthew H.", location: "Garland, TX", text: "Ordered the conservation bundle. Great value and it feels good to give back to Texas nature.", rating: 5 },
  { author: "Nicole C.", location: "Irving, TX", text: "Simple, elegant, and meaningful. A perfect accessory for any outfit.", rating: 5 },
  { author: "Andrew M.", location: "Frisco, TX", text: "Fast delivery and the bracelet exceeded my expectations. The stones feel real and heavy.", rating: 5 },
  { author: "Megan F.", location: "McKinney, TX", text: "I love the adjustable size. Fits my small wrist perfectly without dangling too much.", rating: 5 },
  { author: "Joshua R.", location: "Grand Prairie, TX", text: "Unique designs you can't find in stores. I'm building a collection!", rating: 5 },
  { author: "Stephanie K.", location: "Brownsville, TX", text: "Supporting local conservation while getting beautiful jewelry? Sign me up. Love from the valley!", rating: 5 },
  { author: "Brandon L.", location: "Pasadena, TX", text: "Got the Diamond Tide for my anniversary. She loved it. Thanks Shenna's Studio!", rating: 5 },
  { author: "Lauren V.", location: "Mesquite, TX", text: "The Golden Sunset bracelet is perfect for summer. Matches everything.", rating: 5 },
  { author: "Ryan S.", location: "Killeen, TX", text: "Top notch quality. You can tell a lot of care went into making these.", rating: 5 },
  // National
  { author: "Emily R.", location: "Los Angeles, CA", text: "Stunning craftsmanship! This bracelet is even more beautiful in person. It's my new favorite accessory.", rating: 5 },
  { author: "Michael J.", location: "New York, NY", text: "Fantastic quality and unique design. It arrived quickly and was beautifully packaged. Love Shenna's Studio!", rating: 5 },
  { author: "Jessica A.", location: "Miami, FL", text: "The colors are so vibrant, just like the ocean! I get so many compliments.", rating: 5 },
  { author: "David K.", location: "Chicago, IL", text: "Perfect for gifting. I got one for my sister and she adored it. Will be back for more.", rating: 5 },
  { author: "Sarah L.", location: "Seattle, WA", text: "Beautifully made, and the conservation aspect is a huge plus. Highly recommend!", rating: 5 },
  { author: "James P.", location: "Denver, CO", text: "Exceeded expectations! The detail on the beads is intricate and lovely.", rating: 5 },
  { author: "Emily B.", location: "Atlanta, GA", text: "I love the weight and feel of this bracelet. It's a daily wear for me now.", rating: 5 },
  { author: "Michael S.", location: "Phoenix, AZ", text: "The perfect blend of style and purpose. It’s wonderful knowing my purchase helps the environment.", rating: 5 },
  { author: "Jessica W.", location: "Boston, MA", text: "Arrived sooner than expected! The bracelet is delicate yet feels very sturdy.", rating: 5 },
  { author: "David R.", location: "Portland, OR", text: "Amazing customer service and a truly beautiful product. Couldn't be happier.", rating: 5 },
  { author: "Amanda C.", location: "San Diego, CA", text: "The blue hues are mesmerizing. It captures the essence of the sea perfectly.", rating: 5 },
  { author: "Robert F.", location: "Tampa, FL", text: "The clasp is very secure, and the beads are smooth and well-polished.", rating: 5 },
  { author: "Jennifer H.", location: "St. Louis, MO", text: "A little piece of the coast I can wear every day. It brings me joy.", rating: 5 },
  { author: "Christopher G.", Location: "Philadelphia, PA", text: "Excellent value for the quality. It looks much more expensive than it was.", rating: 5 },
  { author: "Ashley P.", Location: "Austin, TX", text: "I love how Shenna's Studio uses sustainable materials. Makes me feel good about my purchase.", rating: 5 },
  { author: "Matthew V.", Location: "Charlotte, NC", text: "The minimalist design is very chic and versatile.", rating: 5 },
  { author: "Nicole M.", Location: "San Francisco, CA", text: "The 'Ocean Jasper' stone is so unique. It has a calming presence.", rating: 5 },
  { author: "Andrew K.", Location: "Seattle, WA", text: "My new favorite accessory for beach trips and everyday wear.", rating: 5 },
  { author: "Megan L.", Location: "Denver, CO", text: "A beautiful reminder of the ocean's beauty and importance.", rating: 5 },
  { author: "Joshua S.", Location: "Miami, FL", text: "The packaging was eco-friendly, which I really appreciate. The bracelet itself is flawless.", rating: 5 },
  { author: "Stephanie R.", Location: "New York, NY", text: "This bracelet is a conversation starter for all the right reasons – its beauty and its mission.", rating: 5 },
  { author: "Brandon W.", Location: "Chicago, IL", text: "The stones are perfectly smooth and the colors are exactly as pictured.", rating: 5 },
  { author: "Lauren K.", Location: "Houston, TX", text: "Fast shipping and excellent quality. I will be recommending Shenna's Studio to friends.", rating: 5 },
  { author: "Daniel B.", Location: "Dallas, TX", text: "The craftsmanship is evident. It feels very premium and looks amazing.", rating: 5 },
  { author: "Rachel M.", Location: "San Antonio, TX", text: "Wearing this bracelet makes me feel more connected to the ocean.", rating: 5 }
];

async function main() {
  console.log('🌱 Seeding Reviews...')

  // Get first product for reviews
  const product = await prisma.product.findFirst();
  if (!product) {
    console.log('⚠️ No products found. Skipping review seeding.');
  } else {
    // Determine random date within last 6 months
    const getDate = () => {
        const start = new Date();
        start.setMonth(start.getMonth() - 6);
        return new Date(start.getTime() + Math.random() * (new Date().getTime() - start.getTime()));
    }

    // Insert Reviews
    console.log(`   Creating ${reviews.length} reviews...`);
    for (const review of reviews) {
      await prisma.productReview.create({
        data: {
          productId: product.id,
          customerName: review.author,
          rating: review.rating,
          body: review.text,
          title: `Love from ${review.location || 'USA'}`,
          isApproved: true,
          isVerifiedPurchase: true,
          createdAt: getDate(),
        }
      });
    }
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
