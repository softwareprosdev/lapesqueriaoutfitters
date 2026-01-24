import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Fixing admin password...\n');

  const hashedPassword = await bcrypt.hash('Lapesqueria2026!@#', 12);

  const user = await prisma.user.update({
    where: { email: 'admin@lapesqueria.com' },
    data: { password: hashedPassword },
  });

  console.log('✅ Password reset successfully!');
  console.log(`ID: ${user.id}`);
  console.log(`Email: ${user.email}`);
  console.log(`New hash: ${hashedPassword.substring(0, 7)}...`);

  // Verify
  const isValid = await bcrypt.compare('Lapesqueria2026!@#', hashedPassword);
  console.log(`\nPassword verification: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
}

main()
  .catch((e) => {
    console.error('Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
