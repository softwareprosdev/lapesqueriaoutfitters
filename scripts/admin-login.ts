import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Lapesqueria2026!@#', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@lapesqueria.com' },
    update: {},
    create: {
      email: 'admin@lapesqueria.com',
      name: 'La Pesqueria Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('\n===========================================');
  console.log('  ADMIN USER CREATED SUCCESSFULLY');
  console.log('===========================================\n');
  console.log('  Email:    admin@lapesqueria.com');
  console.log('  Password: Lapesqueria2026!@#');
  console.log('  Role:     ADMIN');
  console.log('  ID:', adminUser.id);
  console.log('\n===========================================\n');
}

main()
  .catch((e) => {
    console.error('Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
