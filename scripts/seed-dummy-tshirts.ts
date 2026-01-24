import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding dummy T-Shirts...')

  // 1. Create or get Category
  const categorySlug = 'dummy-t-shirts'
  let category = await prisma.category.findUnique({
    where: { slug: categorySlug }
  })

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'Dummy T-Shirts',
        slug: categorySlug,
        description: 'A test category for T-Shirts (Removable)',
        // Using a placeholder image or an existing one
        image: '/images/shenna-studio-logo.png' 
      }
    })
    console.log(`Created category: ${category.name}`)
  } else {
    console.log(`Using existing category: ${category.name}`)
  }

  // 2. Create Products
  const products = [
    {
      name: 'Dummy Save the Ocean T-Shirt',
      slug: 'dummy-save-the-ocean-tshirt',
      sku: 'DUMMY-TSHIRT-001',
      description: 'A soft cotton t-shirt with an ocean conservation message. 100% Organic Cotton.',
      basePrice: 25.00,
      variants: [
        { name: 'Small / Blue', sku: 'DUMMY-TSHIRT-001-S-BLU', price: 25.00, stock: 50, size: 'S', color: 'Blue', material: 'Cotton' },
        { name: 'Medium / Blue', sku: 'DUMMY-TSHIRT-001-M-BLU', price: 25.00, stock: 50, size: 'M', color: 'Blue', material: 'Cotton' },
        { name: 'Large / Blue', sku: 'DUMMY-TSHIRT-001-L-BLU', price: 25.00, stock: 50, size: 'L', color: 'Blue', material: 'Cotton' },
        { name: 'Small / White', sku: 'DUMMY-TSHIRT-001-S-WHT', price: 25.00, stock: 50, size: 'S', color: 'White', material: 'Cotton' },
        { name: 'Medium / White', sku: 'DUMMY-TSHIRT-001-M-WHT', price: 25.00, stock: 50, size: 'M', color: 'White', material: 'Cotton' },
      ]
    },
    {
      name: 'Dummy Sea Turtle Graphic Tee',
      slug: 'dummy-sea-turtle-tee',
      sku: 'DUMMY-TSHIRT-002',
      description: 'Features a beautiful sea turtle design. Polyester blend.',
      basePrice: 28.00,
      variants: [
        { name: 'Small / Green', sku: 'DUMMY-TSHIRT-002-S-GRN', price: 28.00, stock: 30, size: 'S', color: 'Green', material: 'Polyester' },
        { name: 'Medium / Green', sku: 'DUMMY-TSHIRT-002-M-GRN', price: 28.00, stock: 30, size: 'M', color: 'Green', material: 'Polyester' },
        { name: 'Large / Green', sku: 'DUMMY-TSHIRT-002-L-GRN', price: 28.00, stock: 30, size: 'L', color: 'Green', material: 'Polyester' },
        { name: 'Small / Black', sku: 'DUMMY-TSHIRT-002-S-BLK', price: 28.00, stock: 30, size: 'S', color: 'Black', material: 'Polyester' },
      ]
    }
  ]

  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } })
    if (existing) {
      console.log(`Product ${p.name} already exists. Skipping.`)
      continue
    }

    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        description: p.description,
        basePrice: p.basePrice,
        categoryId: category.id,
        isCustomizable: true,
        conservationPercentage: 15, // Slightly higher for these special tees
        variants: {
          create: p.variants
        },
        images: {
          create: [
             // Using generic placeholder images or existing assets
             { url: '/images/shenna-studio-logo.png', alt: p.name + ' Front View', position: 0 },
             { url: '/images/turtleparallax.jpg', alt: p.name + ' Detail View', position: 1 }
          ]
        }
      }
    })
    console.log(`Created product: ${product.name}`)
  }

  console.log('Seeding complete. You can verify in Admin Panel > Products.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
