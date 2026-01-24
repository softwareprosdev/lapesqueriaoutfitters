/**
 * T-Shirt Inventory Seed Script
 * 
 * Usage:
 *   Local:   npx tsx prisma/seed-tshirts.ts
 *   Coolify: npx tsx -T prisma/seed-tshirts.ts
 *   Or copy to Coolify's task runner
 * 
 * This script creates sample t-shirt products with realistic inventory data
 * for demo purposes.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || process.env.POSTGRES_URL
    }
  }
});

// Available sizes and colors for reference
// const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'] as const;
// const COLORS = [
//   { name: 'White', hex: '#FFFFFF' },
//   { name: 'Black', hex: '#1A1A1A' },
//   { name: 'Navy', hex: '#1E3A5F' },
//   { name: 'Ocean Blue', hex: '#0077B6' },
//   { name: 'Coral', hex: '#FF6B6B' },
//   { name: 'Seafoam', hex: '#9EE6CF' },
//   { name: 'Sand', hex: '#F5E6D3' },
// ];

const T_SHIRT_PRODUCTS = [
  {
    name: 'Ocean Wave T-Shirt',
    description: 'Premium cotton t-shirt featuring our signature ocean wave design. Made with 100% organic cotton for ultimate comfort.',
    basePrice: 34.99,
    categoryName: 'T-Shirts',
    variants: [
      { color: 'White', sizes: { XS: 12, S: 28, M: 45, L: 52, XL: 35, XXL: 18, '3XL': 8 } },
      { color: 'Navy', sizes: { XS: 8, S: 22, M: 38, L: 42, XL: 28, XXL: 12, '3XL': 6 } },
      { color: 'Ocean Blue', sizes: { XS: 5, S: 15, M: 25, L: 30, XL: 20, XXL: 10, '3XL': 4 } },
    ]
  },
  {
    name: 'Sea Turtle Conservation T-Shirt',
    description: 'Support sea turtle conservation with every purchase. Features a beautiful sea turtle illustration.',
    basePrice: 39.99,
    categoryName: 'T-Shirts',
    conservationPercentage: 15,
    variants: [
      { color: 'Seafoam', sizes: { XS: 6, S: 18, M: 32, L: 38, XL: 24, XXL: 10, '3XL': 5 } },
      { color: 'Coral', sizes: { XS: 4, S: 12, M: 22, L: 28, XL: 18, XXL: 8, '3XL': 3 } },
      { color: 'White', sizes: { XS: 10, S: 24, M: 40, L: 48, XL: 32, XXL: 16, '3XL': 8 } },
    ]
  },
  {
    name: 'Marine Life Graphic T-Shirt',
    description: 'Vibrant graphic tee featuring dolphins, whales, and tropical fish. Perfect for ocean lovers.',
    basePrice: 42.99,
    categoryName: 'T-Shirts',
    variants: [
      { color: 'Navy', sizes: { XS: 8, S: 20, M: 35, L: 42, XL: 28, XXL: 14, '3XL': 6 } },
      { color: 'Black', sizes: { XS: 10, S: 25, M: 42, L: 50, XL: 35, XXL: 18, '3XL': 8 } },
      { color: 'Sand', sizes: { XS: 5, S: 14, M: 24, L: 30, XL: 20, XXL: 10, '3XL': 4 } },
    ]
  },
  {
    name: 'Shenna Studio Logo T-Shirt',
    description: 'Official Shenna Studio branded t-shirt. Show your support for marine conservation.',
    basePrice: 29.99,
    categoryName: 'T-Shirts',
    variants: [
      { color: 'White', sizes: { XS: 15, S: 35, M: 55, L: 65, XL: 45, XXL: 25, '3XL': 12 } },
      { color: 'Black', sizes: { XS: 12, S: 28, M: 45, L: 55, XL: 38, XXL: 20, '3XL': 10 } },
      { color: 'Ocean Blue', sizes: { XS: 8, S: 20, M: 32, L: 40, XL: 28, XXL: 14, '3XL': 6 } },
    ]
  },
  {
    name: 'South Padre Island T-Shirt',
    description: 'Commemorative t-shirt featuring South Padre Island landmarks and marine life.',
    basePrice: 36.99,
    categoryName: 'T-Shirts',
    variants: [
      { color: 'Seafoam', sizes: { XS: 6, S: 16, M: 28, L: 35, XL: 22, XXL: 10, '3XL': 5 } },
      { color: 'Sand', sizes: { XS: 8, S: 20, M: 32, L: 40, XL: 26, XXL: 12, '3XL': 6 } },
      { color: 'White', sizes: { XS: 10, S: 22, M: 38, L: 45, XL: 30, XXL: 15, '3XL': 7 } },
    ]
  },
  {
    name: 'Sustainable Fashion T-Shirt',
    description: 'Eco-friendly t-shirt made from recycled materials. Join the sustainable fashion movement.',
    basePrice: 44.99,
    categoryName: 'T-Shirts',
    conservationPercentage: 20,
    variants: [
      { color: 'Coral', sizes: { XS: 4, S: 12, M: 20, L: 26, XL: 16, XXL: 8, '3XL': 4 } },
      { color: 'Seafoam', sizes: { XS: 5, S: 14, M: 24, L: 30, XL: 18, XXL: 9, '3XL': 4 } },
      { color: 'Navy', sizes: { XS: 6, S: 16, M: 28, L: 35, XL: 22, XXL: 11, '3XL': 5 } },
    ]
  },
];

function generateSKU(productName: string, size: string, color: string): string {
  const prefix = productName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'S');
  const colorCode = color.substring(0, 2).toUpperCase().replace(/[^A-Z]/g, 'WH');
  const sizeCode = size.replace(/[^A-Z0-9]/g, '');
  return `${prefix}-${colorCode}-${sizeCode}-${Date.now().toString(36).toUpperCase()}`;
}

async function main() {
  console.log('🌊 Seeding T-Shirt Inventory Data...\n');
  console.log(`📦 Database: ${process.env.DATABASE_URL ? 'Connected' : 'No DATABASE_URL found'}`);

  // Get or create T-Shirts category
  let category = await prisma.category.findFirst({
    where: { slug: 't-shirts' }
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'T-Shirts',
        slug: 't-shirts',
        description: 'Ocean-themed t-shirts supporting marine conservation',
      }
    });
    console.log('✅ Created T-Shirts category');
  } else {
    console.log('📦 Found existing T-Shirts category');
  }

  let totalProducts = 0;
  let totalVariants = 0;

  for (const productData of T_SHIRT_PRODUCTS) {
    // Check if product already exists
    const existingProduct = await prisma.product.findFirst({
      where: { name: productData.name }
    });

    if (existingProduct) {
      console.log(`⏭️  Skipping "${productData.name}" - already exists`);
      continue;
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name: productData.name,
        slug: productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: productData.description,
        sku: `TSHIRT-${Date.now().toString(36).toUpperCase()}`,
        basePrice: productData.basePrice,
        categoryId: category.id,
        conservationPercentage: productData.conservationPercentage || 10,
        featured: Math.random() > 0.7, // 30% chance of being featured
      }
    });

    totalProducts++;

    // Create variants
    for (const variantData of productData.variants) {
      for (const [size, stock] of Object.entries(variantData.sizes)) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            name: `${productData.name} - ${variantData.color} / ${size}`,
            sku: generateSKU(productData.name, size, variantData.color),
            price: productData.basePrice,
            stock: stock,
            size: size,
            color: variantData.color,
            material: '100% Organic Cotton',
          }
        });
        totalVariants++;
      }
    }

    // Add a sample image
    const imageUrls = [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500',
    ];

    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: imageUrls[Math.floor(Math.random() * imageUrls.length)],
        alt: `${productData.name} - Ocean-themed apparel`,
        position: 0,
      }
    });

    // Calculate total units for this product
    let productTotalUnits = 0;
    for (const vData of productData.variants) {
      for (const stock of Object.values(vData.sizes as Record<string, number>)) {
        productTotalUnits += stock;
      }
    }

    console.log(`✅ Created "${productData.name}" with ${productTotalUnits} units`);
  }

  console.log('\n🎉 T-Shirt Seeding Complete!');
  console.log(`   Products created: ${totalProducts}`);
  console.log(`   Variants created: ${totalVariants}`);
  console.log('\n📝 Next steps:');
  console.log('   1. Visit /admin/inventory/tshirts to view the inventory');
  console.log('   2. The page should now show all t-shirt products with analytics');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
