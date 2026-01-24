import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌊 La Pesqueria Outfitters - Sample Products\n');
  console.log('========================================\n');

  // Create categories
  console.log('1. Creating categories...');
  
  const tshirtsCategory = await prisma.category.upsert({
    where: { slug: 't-shirts' },
    update: {},
    create: {
      name: 'T-Shirts',
      slug: 't-shirts',
      description: 'Premium fishing t-shirts with UPF 50+ protection',
    },
  });
  console.log(`   ✅ T-Shirts category: ${tshirtsCategory.id}`);

  const hatsCategory = await prisma.category.upsert({
    where: { slug: 'hats' },
    update: {},
    create: {
      name: 'Hats',
      slug: 'hats',
      description: 'Salt-resistant fishing hats for sun protection',
    },
  });
  console.log(`   ✅ Hats category: ${hatsCategory.id}`);

  const gearCategory = await prisma.category.upsert({
    where: { slug: 'fishing-gear' },
    update: {},
    create: {
      name: 'Fishing Gear',
      slug: 'fishing-gear',
      description: 'Essential fishing accessories and equipment',
    },
  });
  console.log(`   ✅ Fishing Gear category: ${gearCategory.id}`);

  // Create sample T-Shirt products
  console.log('\n2. Creating T-Shirt products...');

  const tshirts = [
    {
      name: 'La Pesqueria Performance Tee',
      slug: 'la-pesqueria-performance-tee',
      description: 'UPF 50+ performance fishing t-shirt. Moisture-wicking, quick-dry, salt-resistant fabric perfect for long days on the water.',
      basePrice: 34.99,
      categoryId: tshirtsCategory.id,
      sku: 'LP-PERF-TEE',
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
      conservationPercentage: 10,
      conservationFocus: 'Coastal Conservation',
      featured: true,
    },
    {
      name: 'Gulf Coast Angler Tee',
      slug: 'gulf-coast-angler-tee',
      description: 'Premium cotton blend fishing t-shirt with coastal-inspired design. Built for the serious angler.',
      basePrice: 29.99,
      categoryId: tshirtsCategory.id,
      sku: 'LP-ANG-TEES',
      imageUrl: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80',
      conservationPercentage: 10,
      conservationFocus: 'Gulf Coast Marine Life',
      featured: true,
    },
    {
      name: 'Sun Protection Fishing Shirt',
      slug: 'sun-protection-fishing-shirt',
      description: 'UPF 50+ long sleeve fishing shirt. Ventilated back, moisture-wicking, and salt-resistant treatment.',
      basePrice: 49.99,
      categoryId: tshirtsCategory.id,
      sku: 'LP-SUN-PRO',
      imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80',
      conservationPercentage: 10,
      conservationFocus: 'Sea Turtle Conservation',
      featured: false,
    },
  ];

  let productCount = 0;
  for (const data of tshirts) {
    const product = await prisma.product.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        basePrice: data.basePrice,
        categoryId: data.categoryId,
        sku: data.sku,
        conservationPercentage: data.conservationPercentage,
        conservationFocus: data.conservationFocus,
        featured: data.featured,
        images: {
          create: { url: data.imageUrl, alt: data.name },
        },
      },
    });
    
    // Create default variant
    await prisma.productVariant.upsert({
      where: { id: `${product.id}-default` },
      update: {},
      create: {
        id: `${product.id}-default`,
        productId: product.id,
        name: 'Default',
        sku: `${data.sku}-001`,
        price: data.basePrice,
        stock: 50,
        size: 'L',
        color: 'Navy',
      },
    });
    
    productCount++;
    console.log(`   ✅ Created: ${data.name}`);
  }

  // Create sample Hat products
  console.log('\n3. Creating Hat products...');

  const hats = [
    {
      name: 'La Pesqueria Fishing Hat',
      slug: 'la-pesqueria-fishing-hat',
      description: 'Wide-brim UPF 50+ fishing hat. Adjustable chin strap, ventilated crown, and salt-resistant finish.',
      basePrice: 44.99,
      categoryId: hatsCategory.id,
      sku: 'LP-FISH-HAT',
      imageUrl: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800&q=80',
      conservationPercentage: 10,
      conservationFocus: 'Coastal Conservation',
      featured: true,
    },
    {
      name: 'Performance Cap',
      slug: 'performance-fishing-cap',
      description: 'Performance fishing cap with UPF 50+ rating. Moisture-wicking sweatband and breathable mesh.',
      basePrice: 28.99,
      categoryId: hatsCategory.id,
      sku: 'LP-PERF-CAP',
      imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80',
      conservationPercentage: 10,
      conservationFocus: 'Marine Mammal Protection',
      featured: false,
    },
  ];

  for (const data of hats) {
    const product = await prisma.product.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        basePrice: data.basePrice,
        categoryId: data.categoryId,
        sku: data.sku,
        conservationPercentage: data.conservationPercentage,
        conservationFocus: data.conservationFocus,
        featured: data.featured,
        images: {
          create: { url: data.imageUrl, alt: data.name },
        },
      },
    });
    
    await prisma.productVariant.upsert({
      where: { id: `${product.id}-default` },
      update: {},
      create: {
        id: `${product.id}-default`,
        productId: product.id,
        name: 'Default',
        sku: `${data.sku}-001`,
        price: data.basePrice,
        stock: 30,
        size: 'Adjustable',
        color: 'Navy',
      },
    });
    
    productCount++;
    console.log(`   ✅ Created: ${data.name}`);
  }

  // Create sample Fishing Gear products
  console.log('\n4. Creating Fishing Gear products...');

  const gear = [
    {
      name: 'Angler Tackle Box Pro',
      slug: 'angler-tackle-box-pro',
      description: 'Professional tackle box with modular compartments. Waterproof, salt-resistant, and built to last.',
      basePrice: 79.99,
      categoryId: gearCategory.id,
      sku: 'LP-TACKLE-PRO',
      imageUrl: 'https://images.unsplash.com/photo-1534590227743-096882d2d300?w=800&q=80',
      conservationPercentage: 10,
      conservationFocus: 'Sustainable Fishing',
      featured: true,
    },
    {
      name: 'Polarized Fishing Glasses',
      slug: 'polarized-fishing-glasses',
      description: 'Premium polarized sunglasses with titanium frames. Reduces glare and protects eyes from UV rays.',
      basePrice: 69.99,
      categoryId: gearCategory.id,
      sku: 'LP-POLAR-GL',
      imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80',
      conservationPercentage: 10,
      conservationFocus: 'Coastal Conservation',
      featured: false,
    },
    {
      name: 'Fishing Glove Set',
      slug: 'fishing-glove-set',
      description: 'UV-protective fishing gloves. Fingerless design for grip, full coverage for sun protection.',
      basePrice: 24.99,
      categoryId: gearCategory.id,
      sku: 'LP-GLOVE-SET',
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
      conservationPercentage: 10,
      conservationFocus: 'Marine Life Protection',
      featured: false,
    },
  ];

  for (const data of gear) {
    const product = await prisma.product.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        basePrice: data.basePrice,
        categoryId: data.categoryId,
        sku: data.sku,
        conservationPercentage: data.conservationPercentage,
        conservationFocus: data.conservationFocus,
        featured: data.featured,
        images: {
          create: { url: data.imageUrl, alt: data.name },
        },
      },
    });
    
    await prisma.productVariant.upsert({
      where: { id: `${product.id}-default` },
      update: {},
      create: {
        id: `${product.id}-default`,
        productId: product.id,
        name: 'Default',
        sku: `${data.sku}-001`,
        price: data.basePrice,
        stock: 25,
        size: 'One Size',
        color: 'Black',
      },
    });
    
    productCount++;
    console.log(`   ✅ Created: ${data.name}`);
  }

  // Summary
  console.log('\n========================================');
  console.log('  SAMPLE PRODUCTS SEEDED SUCCESSFULLY');
  console.log('========================================\n');
  console.log(`  Categories: 3 (T-Shirts, Hats, Fishing Gear)`);
  console.log(`  Products: ${productCount}`);
  console.log(`  Variants: ${productCount} (1 per product)\n`);
}

main()
  .catch((e) => {
    console.error('Error:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
