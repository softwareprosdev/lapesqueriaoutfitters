/**
 * Admin User Seed Script
 *
 * Creates an admin user for La Pesqueria Outfitters
 * Run with: npx tsx scripts/seed-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🐟 La Pesqueria Outfitters - Admin Seed Script\n');

  const adminEmail = 'admin@lapesqueria.com';
  const adminPassword = 'LaPesqueria2024!';
  const adminName = 'La Pesqueria Admin';

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('⚠️  Admin user already exists:', adminEmail);
    console.log('   Updating password...');

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        password: hashedPassword,
        role: 'ADMIN',
        name: adminName,
      },
    });

    console.log('✅ Admin password updated successfully!\n');
  } else {
    console.log('📝 Creating admin user...');

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: 'ADMIN',
        emailVerified: new Date(),
      },
    });

    console.log('✅ Admin user created successfully!\n');
  }

  console.log('═══════════════════════════════════════════');
  console.log('   ADMIN LOGIN CREDENTIALS');
  console.log('═══════════════════════════════════════════');
  console.log(`   Email:    ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log('═══════════════════════════════════════════\n');
  console.log('🔐 IMPORTANT: Change this password after first login!\n');
  console.log('🌐 Login at: https://lapesqueria.com/admin/login\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
