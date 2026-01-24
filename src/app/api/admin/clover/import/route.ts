import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

interface CloverConfig {
  apiToken: string;
  merchantId: string;
}

interface SyncOptions {
  importItems: boolean;
  importCategories: boolean;
  importCustomers: boolean;
  importOrders: boolean;
  importPayments: boolean;
  importModifiers: boolean;
  importTaxRates: boolean;
  updateExisting: boolean;
  skipDuplicates: boolean;
}

interface CloverItem {
  id: string;
  name: string;
  price: number;
  cost?: number;
  sku?: string;
  categories?: { id: string }[];
  modifiedTime?: number;
  // Add other Clover item fields as needed
}

interface CloverCategory {
  id: string;
  name: string;
  sortOrder?: number;
  // Add other Clover category fields as needed
}

interface CloverCustomer {
  id: string;
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  phoneNumber?: string;
  // Add other Clover customer fields as needed
}

interface CloverOrder {
  id: string;
  total: number;
  createdTime: number;
  customer?: { id: string };
  lineItems?: any[];
  payments?: any[];
  // Add other Clover order fields as needed
}

async function importItems(items: CloverItem[], options: SyncOptions) {
  let imported = 0;
  let skipped = 0;
  let updated = 0;

  for (const item of items) {
    try {
      // Check if item already exists
      const existingItem = await prisma.product.findFirst({
        where: {
          OR: [
            { name: item.name },
            item.sku ? { sku: item.sku } : {},
          ].filter(Boolean)
        }
      });

      if (existingItem) {
        if (options.skipDuplicates) {
          skipped++;
          continue;
        }
        if (options.updateExisting) {
          await prisma.product.update({
            where: { id: existingItem.id },
            data: {
              name: item.name,
              basePrice: item.price / 100, // Clover uses cents
              ...(item.sku && { sku: item.sku }),
              updatedAt: new Date(item.modifiedTime || Date.now())
            }
          });
          updated++;
          continue;
        }
      }

      // Create new item
      await prisma.product.create({
        data: {
          name: item.name,
          slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          description: '',
          sku: item.sku || `CLOVER-${item.id}`, // Generate SKU if missing
          basePrice: item.price / 100, // Clover uses cents
          featured: false,
        }
      });
      imported++;
    } catch (error) {
      console.error('Error importing item:', item.name, error);
    }
  }

  return { imported, skipped, updated };
}

async function importCategories(categories: CloverCategory[], options: SyncOptions) {
  let imported = 0;
  let skipped = 0;
  let updated = 0;

  for (const category of categories) {
    try {
      // Check if category already exists
      const existingCategory = await prisma.category.findFirst({
        where: { name: category.name }
      });

      if (existingCategory) {
        if (options.skipDuplicates) {
          skipped++;
          continue;
        }
        if (options.updateExisting) {
          // Update existing category
          await prisma.category.update({
            where: { id: existingCategory.id },
            data: { name: category.name }
          });
          updated++;
          continue;
        }
      }

      // Create new category
      await prisma.category.create({
        data: {
          name: category.name,
          slug: category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        }
      });
      imported++;
    } catch (error) {
      console.error('Error importing category:', category.name, error);
    }
  }

  return { imported, skipped, updated };
}

async function importCustomers(customers: CloverCustomer[], options: SyncOptions) {
  let imported = 0;
  let skipped = 0;
  let updated = 0;

  for (const customer of customers) {
    try {
      // Check if customer already exists by email
      const existingCustomer = customer.emailAddress ?
        await prisma.user.findFirst({
          where: { email: customer.emailAddress }
        }) : null;

      if (existingCustomer) {
        if (options.skipDuplicates) {
          skipped++;
          continue;
        }
        if (options.updateExisting) {
          // Update existing customer
          await prisma.user.update({
            where: { id: existingCustomer.id },
            data: {
              name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
              // Don't update email or role
            }
          });
          updated++;
          continue;
        }
      }

      // Create new customer
      if (customer.emailAddress) {
        const tempPassword = await bcrypt.hash('TempPass123!', 10); // Temporary password
        await prisma.user.create({
          data: {
            name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
            email: customer.emailAddress,
            password: tempPassword,
            role: 'CUSTOMER',
          }
        });
        imported++;
      }
    } catch (error) {
      console.error('Error importing customer:', customer.emailAddress, error);
    }
  }

  return { imported, skipped, updated };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { config, syncData, options }: {
      config: CloverConfig;
      syncData: any;
      options: SyncOptions;
    } = await request.json();

    const results: any = {};

    // Import selected data types
    if (options.importCategories && syncData.categories) {
      results.categories = await importCategories(syncData.categories, options);
    }

    if (options.importItems && syncData.items) {
      results.items = await importItems(syncData.items, options);
    }

    if (options.importCustomers && syncData.customers) {
      results.customers = await importCustomers(syncData.customers, options);
    }

    // For orders, payments, modifiers, and tax rates, we'll implement basic logging for now
    // These would require more complex mapping to the existing schema

    if (options.importOrders && syncData.orders) {
      results.orders = { total: syncData.orders.length, message: 'Order import not yet implemented - requires schema mapping' };
    }

    if (options.importPayments && syncData.payments) {
      results.payments = { total: syncData.payments.length, message: 'Payment import not yet implemented - requires schema mapping' };
    }

    if (options.importModifiers && syncData.modifiers) {
      results.modifiers = { total: syncData.modifiers.length, message: 'Modifier import not yet implemented - requires schema mapping' };
    }

    if (options.importTaxRates && syncData.taxRates) {
      results.taxRates = { total: syncData.taxRates.length, message: 'Tax rate import not yet implemented - requires schema mapping' };
    }

    return NextResponse.json({
      success: true,
      results,
      message: 'Data import completed. Some data types may require additional schema mapping.'
    });
  } catch (error: unknown) {
    console.error('Error importing Clover data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to import Clover data' },
      { status: 500 }
    );
  }
}