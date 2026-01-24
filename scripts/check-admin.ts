import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking admin user...\n');

  const user = await prisma.user.findUnique({
    where: { email: 'admin@lapesqueria.com' },
    select: { id: true, email: true, password: true, role: true }
  });

  if (!user) {
    console.log('❌ Admin user NOT found!');
    console.log('Creating new admin user...');
    
    const hashedPassword = await bcrypt.hash('Lapesqueria2026!@#', 12);
    
    const newUser = await prisma.user.create({
      data: {
        email: 'admin@lapesqueria.com',
        name: 'La Pesqueria Admin',
        password: hashedPassword,
        role: 'ADMIN',
      }
    });
    
    console.log('✅ Admin created!');
    console.log(`ID: ${newUser.id}`);
    return;
  }

  console.log('✅ Admin user found!');
  console.log(`ID: ${user.id}`);
  console.log(`Email: ${user.email}`);
  console.log(`Role: ${user.role}`);
  console.log(`Password hash: ${user.password.substring(0, 7)}...`);

  // Test password
  const testPassword = 'Lapesqueria2026!@#';
  const isValid = await bcrypt.compare(testPassword, user.password);
  
  console.log(`\nTesting password "${testPassword}":`);
  console.log(isValid ? '✅ Password is VALID' : '❌ Password is INVALID');
}

main()
  .catch((e) => {
    console.error('Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
