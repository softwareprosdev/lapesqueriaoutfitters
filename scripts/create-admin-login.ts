import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create Admin User for Admin Panel Login
  const adminPassword = await bcrypt.hash('Lapesqueria2026!@#', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@lapesqueria.com' },
    update: {},
    create: {
      email: 'admin@lapesqueria.com',
      name: 'La Pesqueria Admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create Staff User
  const staffPassword = await bcrypt.hash('Lapesqueria2026!@#', 12);

  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@lapesqueria.com' },
    update: {},
    create: {
      email: 'staff@lapesqueria.com',
      name: 'La Pesqueria Staff',
      password: staffPassword,
      role: 'STAFF',
    },
  });

  console.log('\n============================================');
  console.log('  LA PESQUERIA OUTFITTERS - ADMIN PANEL LOGIN');
  console.log('============================================\n');
  console.log('  ┌────────────────────────────────────────┐');
  console.log('  │         ADMIN CREDENTIALS             │');
  console.log('  ├────────────────────────────────────────┤');
  console.log(`  │  Email:    admin@lapesqueria.com │`);
  console.log(`  │  Password: Lapesqueria2026!@#            │`);
  console.log('  │  Role:     ADMIN                       │');
  console.log('  └────────────────────────────────────────┘\n');
  console.log('  Admin ID:', adminUser.id);
  console.log('  Created:', adminUser.createdAt);
  console.log('\n');
  console.log('  ┌────────────────────────────────────────┐');
  console.log('  │         STAFF CREDENTIALS (Optional)   │');
  console.log('  ├────────────────────────────────────────┤');
  console.log(`  │  Email:    staff@lapesqueria.com │`);
  console.log(`  │  Password: Lapesqueria2026!@#            │`);
  console.log('  │  Role:     STAFF                        │');
  console.log('  └────────────────────────────────────────┘\n');
  console.log('  Staff ID:', staffUser.id);
  console.log('\n  ✅ Admin panel login credentials created successfully!\n');
  console.log('  Login URL: http://localhost:3000/admin/login\n');
  console.log('============================================\n');

  // Update Site Settings with new contact info
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {
      siteName: 'La Pesqueria Outfitters',
      email: 'info@lapesqueria.com',
      phone: '(956) 555-0123',
      address: '4400 N 23rd St Suite 135, McAllen, TX 78504',
      updatedAt: new Date(),
    },
    create: {
      id: 'default',
      siteName: 'La Pesqueria Outfitters',
      email: 'info@lapesqueria.com',
      phone: '(956) 555-0123',
      address: '4400 N 23rd St Suite 135, McAllen, TX 78504',
    },
  });

  console.log('  ✅ Site settings updated with La Pesqueria info\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
