import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌊 La Pesqueria Outfitters - Database Setup\n');
  console.log('========================================\n');

  // 1. Create Admin User
  console.log('1. Creating admin user...');
  const adminEmail = 'fishingpro@lapesqueria.com';
  const adminPassword = 'FishingPro@2026!';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hashedPassword, name: 'Fishing Pro', role: 'ADMIN' },
    create: {
      email: adminEmail,
      name: 'Fishing Pro',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log(`   ✅ Admin created: ${admin.email}\n`);

  // 2. Create Staff User
  console.log('2. Creating staff user...');
  const staffEmail = 'staff@lapesqueria.com';
  const staffPassword = 'Staff@2026!';
  const staffHashed = await bcrypt.hash(staffPassword, 12);

  const staff = await prisma.user.upsert({
    where: { email: staffEmail },
    update: { password: staffHashed, name: 'La Pesqueria Staff', role: 'STAFF' },
    create: {
      email: staffEmail,
      name: 'La Pesqueria Staff',
      password: staffHashed,
      role: 'STAFF',
    },
  });
  console.log(`   ✅ Staff created: ${staff.email}\n`);

  // 3. Seed Blog Posts
  console.log('3. Seeding blog posts...');
  const blogPosts = [
    {
      title: 'Top 10 Fishing Essentials Every Angler Needs in 2026',
      slug: 'top-10-fishing-essentials-2026',
      excerpt: 'Discover the must-have fishing gear that professional anglers swear by.',
      content: `<h2>Gear Up for Success</h2><p>Whether you're a seasoned angler or just getting started, having the right gear makes all the difference.</p><h3>1. UPF 50+ Performance Fishing Shirts</h3><p>Sun protection is essential for anyone spending long hours on the water.</p><h3>2. Salt-Resistant Fishing Hat</h3><p>A quality fishing hat with a wide brim provides essential face and neck protection.</p><h3>3. Polarized Sunglasses</h3><p>Polarized lenses cut glare from the water surface, allowing you to spot fish more easily.</p><h3>4. Tackle Box Organization System</h3><p>Stay organized with a modular tackle system.</p><h3>5. Performance Fishing Shorts</h3><p>Quick-dry shorts with multiple pockets keep gear accessible.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
      category: 'Gear Guides',
      tags: ['fishing gear', 'essentials', 'accessories'],
      featured: true,
      published: true,
    },
    {
      title: 'Best UPF 50+ Fishing Shirts for Texas Anglers',
      slug: 'best-upf-50-fishing-shirts-texas',
      excerpt: 'Texas sun is intense. Discover the best UPF 50+ fishing shirts.',
      content: `<h2>Sun Protection Matters</h2><p>Texas summers can be brutal, with intense UV exposure. For anglers spending hours on the water, proper sun protection is essential.</p><h3>Why UPF 50+ Matters</h3><p>UPF 50+ shirts block 98% of UV rays, providing equivalent protection to SPF 50 sunscreen.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1571942676516-bcab84649e44?w=800&q=80',
      category: 'Gear Guides',
      tags: ['fishing shirts', 'sun protection', 'UPF 50'],
      featured: true,
      published: true,
    },
    {
      title: 'Complete Guide to Salt-Resistant Fishing Gear',
      slug: 'salt-resistant-fishing-gear-guide',
      excerpt: 'Saltwater is brutal on gear. Learn which fishing equipment stands up to marine environments.',
      content: `<h2>Battle-Tested Gear</h2><p>Saltwater is incredibly corrosive, and your fishing gear takes a beating every time you hit the water.</p><h3>Understanding Salt Damage</h3><p>Salt crystals form when seawater evaporates on your gear, causing corrosion and degradation.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1545816250-e12bedba42ba?w=800&q=80',
      category: 'Gear Guides',
      tags: ['salt-resistant', 'fishing gear', 'maintenance'],
      featured: false,
      published: true,
    },
    {
      title: 'Best Fishing Hats for Texas Anglers: 2026 Buyers Guide',
      slug: 'best-fishing-hats-texas-2026',
      excerpt: 'From wide-brim sun hats to performance caps, find the perfect fishing hat.',
      content: `<h2>Top of the Class</h2><p>A quality fishing hat is your first line of defense against heat and UV rays.</p><h3>Hat Styles Compared</h3><p>Wide-brim hats provide maximum protection, while performance caps offer convenience.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1676395245813-9cd304454501?w=800&q=80',
      category: 'Gear Guides',
      tags: ['fishing hats', 'sun protection', 'Texas fishing'],
      featured: true,
      published: true,
    },
    {
      title: 'Morning Fishing Trip Checklist: Never Forget Anything Again',
      slug: 'morning-fishing-trip-checklist',
      excerpt: 'Create the ultimate fishing trip checklist. From licenses to sunscreen.',
      content: `<h2>The Ultimate Morning Fishing Trip Checklist</h2><p>There's nothing worse than driving to your favorite spot only to realize you left something behind.</p><h3>Documents & Essentials</h3><p>Texas Fishing License, Saltwater Endorsement, ID, Insurance.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800&q=80',
      category: 'Tips & Tricks',
      tags: ['fishing checklist', 'preparation', 'Texas fishing'],
      featured: false,
      published: true,
    },
    {
      title: 'Essential Fishing Accessories Every Angler Should Own',
      slug: 'essential-fishing-accessories',
      excerpt: 'Beyond the basics: discover fishing accessories that experienced anglers love.',
      content: `<h2>Beyond the Basics</h2><p>The accessories separate comfortable, organized anglers from the struggling masses.</p><h3>Tackle Management</h3><p>Modular tackle boxes with adjustable dividers let you customize for any lure type.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800&q=80',
      category: 'Gear Guides',
      tags: ['fishing accessories', 'tackle', 'gear'],
      featured: true,
      published: true,
    },
  ];

  // Get or create admin author
  let author = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!author) {
    author = await prisma.user.create({
      data: { email: adminEmail, name: 'Fishing Pro', password: hashedPassword, role: 'ADMIN' },
    });
  }

  let postsCreated = 0;
  for (const post of blogPosts) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } });
    if (!existing) {
      await prisma.blogPost.create({ data: { ...post, authorId: author.id } });
      postsCreated++;
      console.log(`   ✅ Created: ${post.title}`);
    } else {
      console.log(`   ⏭️  Skipped: ${post.title} (already exists)`);
    }
  }
  console.log(`   📝 Blog posts: ${postsCreated} created\n`);

  // Summary
  console.log('========================================');
  console.log('  DATABASE SETUP COMPLETE');
  console.log('========================================\n');
  console.log('  ADMIN LOGIN:');
  console.log('  ----------------------------------------');
  console.log(`  Email:    ${adminEmail}`);
  console.log(`  Password: ${adminPassword}`);
  console.log('  ----------------------------------------\n');
  console.log('  STAFF LOGIN:');
  console.log('  ----------------------------------------');
  console.log(`  Email:    ${staffEmail}`);
  console.log(`  Password: ${staffPassword}`);
  console.log('  ----------------------------------------\n');
}

main()
  .catch((e) => {
    console.error('Error:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
