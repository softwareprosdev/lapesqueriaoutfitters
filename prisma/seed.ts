import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Production Seeding - Setting up essential data...')

  // ===========================
  // GET OR CREATE ADMIN USER
  // ===========================
  console.log('👤 Checking admin user...')

  const hashedAdminPassword = await bcrypt.hash('LaPesqueria@2026!Admin', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lapesqueriaoutfitters.com' },
    update: {},
    create: {
      email: 'admin@lapesqueriaoutfitters.com',
      password: hashedAdminPassword,
      name: 'La Pesqueria Admin',
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin user ready')

  // Get or create staff user
  const hashedStaffPassword = await bcrypt.hash('LaPesqueria@2026!Staff', 10)
  await prisma.user.upsert({
    where: { email: 'staff@lapesqueriaoutfitters.com' },
    update: {},
    create: {
      email: 'staff@lapesqueriaoutfitters.com',
      password: hashedStaffPassword,
      name: 'Staff Member',
      role: 'STAFF',
    },
  })
  console.log('✅ Staff user ready')

  // ===========================
  // PRODUCT CATEGORIES (T-Shirts, Hats, and Fishing Gear)
  // ===========================
  console.log('📁 Checking product categories...')

  const tshirtCategoryData = [
    { name: 'T-Shirts', slug: 'tshirts', description: 'Performance fishing t-shirts and casual apparel' },
    { name: 'Performance Shirts', slug: 'performance-shirts', description: 'UPF 50+ performance fishing shirts' },
    { name: 'Hoodies & Sweatshirts', slug: 'hoodies', description: 'Fishing hoodies and sweatshirts for cool mornings' },
    { name: 'Hats & Caps', slug: 'hats', description: 'Fishing caps, hats, and sun protection' },
    { name: 'Polos', slug: 'polos', description: 'Performance fishing polos' },
  ]

  const categoryData = [...tshirtCategoryData]

  const categories = []
  for (const cat of categoryData) {
    let category = await prisma.category.findUnique({ where: { slug: cat.slug } })
    if (!category) {
      category = await prisma.category.create({
        data: {
          ...cat,
          image: cat.slug.startsWith('tshirt') 
            ? 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'
            : 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
        },
      })
    }
    categories.push(category)
  }

  console.log(`✅ ${categories.length} product categories ready\n`)

  // ===========================
  // T-SHIRT SIZES
  // ===========================
  console.log('📏 Checking t-shirt sizes...')
  const defaultSizes = [
    { name: 'XS', label: 'Extra Small', chestWidth: '34-36', length: '26', displayOrder: 1 },
    { name: 'S', label: 'Small', chestWidth: '36-38', length: '27', displayOrder: 2 },
    { name: 'M', label: 'Medium', chestWidth: '38-40', length: '28', displayOrder: 3 },
    { name: 'L', label: 'Large', chestWidth: '40-42', length: '29', displayOrder: 4 },
    { name: 'XL', label: 'Extra Large', chestWidth: '42-44', length: '30', displayOrder: 5 },
    { name: '2XL', label: '2X Large', chestWidth: '44-46', length: '31', displayOrder: 6 },
    { name: '3XL', label: '3X Large', chestWidth: '46-48', length: '32', displayOrder: 7 },
  ]

  for (const sizeData of defaultSizes) {
    await prisma.tShirtSize.upsert({
      where: { name: sizeData.name },
      update: {},
      create: { ...sizeData, isActive: true },
    })
  }
  console.log('✅ T-shirt sizes ready\n')

  // ===========================
  // T-SHIRT COLORS
  // ===========================
  console.log('🎨 Checking t-shirt colors...')
  const defaultColors = [
    { name: 'Navy', hexCode: '#001F3F', displayOrder: 1 },
    { name: 'White', hexCode: '#FFFFFF', displayOrder: 2 },
    { name: 'Heather Blue', hexCode: '#6B8E9F', displayOrder: 3 },
    { name: 'Sage Green', hexCode: '#9CAF88', displayOrder: 4 },
    { name: 'Sand', hexCode: '#D4C4A8', displayOrder: 5 },
    { name: 'Charcoal', hexCode: '#36454F', displayOrder: 6 },
    { name: 'Coral', hexCode: '#FF7F50', displayOrder: 7 },
    { name: 'Deep Ocean', hexCode: '#1B3A5F', displayOrder: 8 },
  ]

  for (const colorData of defaultColors) {
    await prisma.tShirtColor.upsert({
      where: { name: colorData.name },
      update: {},
      create: { ...colorData, isActive: true },
    })
  }
  console.log('✅ T-shirt colors ready\n')

  // ===========================
  // CONSERVATION PARTNERS (for map)
  // ===========================
  console.log('🐢 Creating/updating conservation partners with location data...')

  const partnerData = [
    {
      name: 'Sea Turtle Inc.',
      description: "South Padre Island's premier sea turtle rescue and rehabilitation center. Home to dozens of rescued Kemp's Ridley sea turtles.",
      website: 'https://www.seaturtleinc.org',
      contactEmail: 'info@seaturtleinc.org',
      focusAreas: ["Kemp's Ridley Sea Turtles", 'Turtle Rescue', 'Education', 'Rehabilitation'],
      location: 'South Padre Island, TX',
    },
    {
      name: 'Rio Grande Valley Nature Coalition',
      description: 'Protecting the unique ecosystems of the Rio Grande Valley through habitat restoration and wildlife conservation.',
      website: 'https://www.rgvnature.org',
      contactEmail: 'info@rgvnature.org',
      focusAreas: ['Wildlife Habitat', 'Coastal Restoration', 'Education', 'Wetlands'],
      location: 'Brownsville, TX',
    },
    {
      name: 'Gulf Coast Whale Research',
      description: 'Dedicated to studying and protecting whales and dolphins in the Gulf of Mexico through scientific research and public education.',
      website: 'https://www.gulfwhales.org',
      contactEmail: 'research@gulfwhales.org',
      focusAreas: ['Whale Migration', 'Marine Research', 'Dolphin Conservation', 'Ocean Health'],
      location: 'Corpus Christi, TX',
    },
    {
      name: 'Coastal Conservation Association Texas',
      description: 'Working to protect and enhance marine resources along the Texas coast for generations to come.',
      website: 'https://www.ccatexas.org',
      contactEmail: 'info@ccatexas.org',
      focusAreas: ['Habitat Restoration', 'Fish Conservation', 'Clean Water', 'Advocacy'],
      location: 'Houston, TX',
    },
    {
      name: 'Texas State Aquarium',
      description: 'Inspiring conservation of the Gulf of Mexico through education, animal rehabilitation, and research programs.',
      website: 'https://www.texasstateaquarium.org',
      contactEmail: 'info@txstateaquarium.org',
      focusAreas: ['Marine Education', 'Animal Rescue', 'Research', 'Conservation'],
      location: 'Corpus Christi, TX',
    },
  ]

  const partners = []
  for (const pd of partnerData) {
    let partner = await prisma.conservationPartner.findFirst({ where: { name: pd.name } })
    if (!partner) {
      partner = await prisma.conservationPartner.create({
        data: {
          ...pd,
          logo: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=200',
          totalDonations: 0,
          donationCount: 0,
          isActive: true,
          verifiedAt: new Date(),
        },
      })
    }
    partners.push(partner)
  }

  console.log(`✅ ${partners.length} conservation partners ready\n`)

  // ===========================
  // DISCOUNT CODES (if not exist)
  // ===========================
  console.log('🏷️  Checking discount codes...')

  const discountCodes = [
    { code: 'OCEAN10', type: 'PERCENTAGE' as const, value: 10, description: '10% off all orders' },
    { code: 'TURTLE15', type: 'PERCENTAGE' as const, value: 15, description: '15% off Sea Turtle Collection' },
    { code: 'FREESHIP', type: 'FREE_SHIPPING' as const, value: 0, description: 'Free shipping on orders over $50' },
    { code: 'LUXURY20', type: 'PERCENTAGE' as const, value: 20, description: '20% off Luxury Collection' },
    { code: 'SAVE25', type: 'FIXED_AMOUNT' as const, value: 25, description: '$25 off orders over $150' },
  ]

  for (const dc of discountCodes) {
    const existing = await prisma.discountCode.findUnique({ where: { code: dc.code } })
    if (!existing) {
      await prisma.discountCode.create({
        data: {
          ...dc,
          usageLimit: 1000,
          usageCount: 0,
          minPurchaseAmount: dc.code === 'SAVE25' ? 150 : dc.code === 'FREESHIP' ? 50 : 25,
          isActive: true,
          createdBy: admin.id,
        },
      })
    }
  }

  console.log(`✅ Discount codes ready\n`)

  // ===========================
  // IMPORT STRIPE ORDERS (DISABLED - Schema uses Clover)
  // ===========================
  /*
  if (stripe) {
    console.log('💳 Importing historical Stripe orders...')
    await importStripeOrders()
  } else {
    console.log('⚠️  Skipping Stripe order import (STRIPE_SECRET_KEY not configured)')
  }
  */

  console.log('═══════════════════════════════════════════════════════════════')
  console.log('🎉 PRODUCTION SEEDING COMPLETED!')
  console.log('═══════════════════════════════════════════════════════════════\n')
}

/**
 * Import historical orders from Stripe
 * (DISABLED - Schema uses Clover)
 */
/*
async function importStripeOrders() {
  ...
}

async function importSingleOrder(session: Stripe.Checkout.Session) {
  ...
}
*/

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })