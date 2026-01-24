import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌊 Creating La Pesqueria Admin User...\n');

  const email = 'admin@lapesqueria.com';
  const password = 'LaPesqueria@2026!';
  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { 
      password: hashedPassword,
      name: 'La Pesqueria Admin',
      role: 'ADMIN',
    },
    create: {
      email,
      name: 'La Pesqueria Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created/updated successfully!');
  console.log(`   Email:    ${admin.email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Role:     ${admin.role}`);
  console.log(`   ID:       ${admin.id}`);
  console.log('\n========================================');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
