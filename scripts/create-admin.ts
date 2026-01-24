import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating admin user...\n');

  // Hash the password
  const hashedPassword = await bcrypt.hash('Lapesqueria2026!@#', 12);

  // Create or update admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@lapesqueria.com' },
    update: {
      password: hashedPassword,
      name: 'La Pesqueria Admin',
      role: 'ADMIN',
    },
    create: {
      email: 'admin@lapesqueria.com',
      password: hashedPassword,
      name: 'La Pesqueria Admin',
      role: 'ADMIN',
    },
  });

  console.log('===========================================');
  console.log('  ADMIN USER CREATED/UPDATED');
  console.log('===========================================\n');
  console.log(`  ID:    ${adminUser.id}`);
  console.log(`  Email: ${adminUser.email}`);
  console.log(`  Role:  ${adminUser.role}`);
  console.log('\n===========================================\n');

  // Verify by reading back
  const verify = await prisma.user.findUnique({
    where: { email: 'admin@lapesqueria.com' },
    select: { id: true, email: true, role: true, password: true }
  });

  if (verify) {
    console.log('✅ Admin user verified in database');
    console.log(`   Password hash starts with: ${verify.password.substring(0, 7)}...`);
  } else {
    console.log('❌ Admin user NOT found after creation');
  }
}

main()
  .catch((e) => {
    console.error('Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
