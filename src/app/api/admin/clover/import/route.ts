import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

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

interface CloverItemData {
  id: string;
  name: string;
  alternateName?: string;
  price: number;
  priceType?: string;
  cost?: number;
  sku?: string;
  hidden?: boolean;
  stockCount?: number;
  isRevenue?: boolean;
  unitName?: string;
  categories?: { elements?: { id: string; name: string }[] };
  taxRates?: { elements?: { id: string }[] };
  modifierGroups?: { elements?: { id: string }[] };
  modifiedTime?: number;
  itemStock?: { stockCount?: number };
}

interface CloverCategoryData {
  id: string;
  name: string;
  sortOrder?: number;
}

interface CloverCustomerData {
  id: string;
  firstName?: string;
  lastName?: string;
  // Clover returns emailAddresses as an array, NOT emailAddress
  emailAddresses?: { elements?: { emailAddress: string; primaryEmail?: boolean }[] };
  phoneNumbers?: { elements?: { phoneNumber: string }[] };
  addresses?: { elements?: { address1?: string; city?: string; state?: string; zip?: string; country?: string }[] };
  marketingAllowed?: boolean;
  createdTime?: number;
}

interface CloverOrderData {
  id: string;
  state: string;
  title?: string;
  note?: string;
  total?: number;
  taxAmount?: number;
  tipAmount?: number;
  discountAmount?: number;
  serviceCharge?: number;
  employee?: { id: string; name?: string };
  customers?: { elements?: { id: string }[] };
  device?: { id: string };
  orderType?: { id: string; label?: string };
  createdTime?: number;
  modifiedTime?: number;
  lineItems?: { elements?: CloverLineItemData[] };
  payments?: { elements?: { id: string }[] };
}

interface CloverLineItemData {
  id: string;
  name: string;
  alternateName?: string;
  price: number;
  unitQty?: number;
  note?: string;
  item?: { id: string };
  discounts?: { elements?: { amount: number }[] };
  modifications?: { elements?: { modifier: { id: string; name: string; amount?: number } }[] };
  taxRates?: { elements?: { rate: number; taxAmount: number }[] };
}

interface CloverPaymentData {
  id: string;
  amount: number;
  tipAmount?: number;
  taxAmount?: number;
  tender?: { id: string; label?: string; labelKey?: string };
  cardTransaction?: { cardType?: string; last4?: string };
  result: string;
  order?: { id: string };
  externalPaymentId?: string;
  createdTime?: number;
}

interface CloverModifierGroupData {
  id: string;
  name: string;
  showByDefault?: boolean;
  minRequired?: number;
  maxAllowed?: number;
  modifiers?: { elements?: CloverModifierData[] };
  items?: { elements?: { id: string }[] };
}

interface CloverModifierData {
  id: string;
  name: string;
  alternateName?: string;
  price?: number;
  available?: boolean;
}

interface CloverTaxRateData {
  id: string;
  name: string;
  rate: number;
  isDefault?: boolean;
  taxableAmount?: string;
}

interface ImportResult {
  imported: number;
  skipped: number;
  updated: number;
  failed: number;
  errors: string[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function generateSku(prefix: string, id: string): string {
  return `${prefix}-${id.slice(-8).toUpperCase()}`;
}

async function getOrCreateCloverConfig(merchantId: string, apiToken: string) {
  let config = await prisma.cloverConfig.findUnique({
    where: { merchantId }
  });

  if (!config) {
    config = await prisma.cloverConfig.create({
      data: {
        merchantId,
        accessToken: apiToken,
        environment: 'production',
        autoSyncEnabled: true,
      }
    });
  }

  return config;
}

// ============================================================================
// CATEGORY IMPORT
// ============================================================================

async function importCategories(
  categories: CloverCategoryData[],
  options: SyncOptions
): Promise<ImportResult> {
  const result: ImportResult = { imported: 0, skipped: 0, updated: 0, failed: 0, errors: [] };

  for (const category of categories) {
    try {
      const slug = generateSlug(category.name);

      const existingCategory = await prisma.category.findFirst({
        where: {
          OR: [
            { name: category.name },
            { slug }
          ]
        }
      });

      if (existingCategory) {
        if (options.skipDuplicates) {
          result.skipped++;
          continue;
        }
        if (options.updateExisting) {
          await prisma.category.update({
            where: { id: existingCategory.id },
            data: { name: category.name }
          });
          result.updated++;
          continue;
        }
      }

      // Create new category
      await prisma.category.create({
        data: {
          name: category.name,
          slug: existingCategory ? `${slug}-${Date.now()}` : slug,
        }
      });
      result.imported++;
    } catch (error) {
      result.failed++;
      result.errors.push(`Category "${category.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return result;
}

// ============================================================================
// ITEM IMPORT (with CloverItem mirror and ProductVariant creation)
// ============================================================================

async function importItems(
  items: CloverItemData[],
  options: SyncOptions,
  merchantId: string,
  apiToken: string
): Promise<ImportResult> {
  const result: ImportResult = { imported: 0, skipped: 0, updated: 0, failed: 0, errors: [] };

  // Get or create CloverConfig
  const cloverConfig = await getOrCreateCloverConfig(merchantId, apiToken);

  for (const item of items) {
    try {
      // Check for existing CloverItem by cloverId
      const existingCloverItem = await prisma.cloverItem.findUnique({
        where: { cloverId: item.id }
      });

      // Convert price from cents to dollars for local Product
      const priceInDollars = item.price / 100;
      const costInCents = item.cost || 0;
      const stockCount = item.itemStock?.stockCount ?? item.stockCount ?? 0;
      const sku = item.sku || generateSku('CLV', item.id);

      // Get category info from Clover data
      const cloverCategoryId = item.categories?.elements?.[0]?.id || null;
      const cloverCategoryName = item.categories?.elements?.[0]?.name || null;

      // Get tax rate IDs
      const taxRateIds = item.taxRates?.elements?.map(t => t.id) || [];

      // Get modifier group IDs
      const modifierGroupIds = item.modifierGroups?.elements?.map(m => m.id) || [];

      if (existingCloverItem) {
        if (options.skipDuplicates) {
          result.skipped++;
          continue;
        }

        if (options.updateExisting) {
          // Update CloverItem mirror record
          await prisma.cloverItem.update({
            where: { id: existingCloverItem.id },
            data: {
              name: item.name,
              alternateName: item.alternateName,
              sku,
              price: item.price,
              priceType: item.priceType || 'FIXED',
              unitName: item.unitName,
              stockCount,
              isStockTracked: true,
              cloverCategoryId,
              cloverCategoryName,
              taxRateIds,
              modifierGroupIds,
              isRevenue: item.isRevenue ?? true,
              isHidden: item.hidden ?? false,
              cost: costInCents,
              lastSyncedAt: new Date(),
              cloverModifiedAt: item.modifiedTime ? new Date(item.modifiedTime) : null,
            }
          });

          // Update linked Product if it exists
          if (existingCloverItem.localProductId) {
            const product = await prisma.product.update({
              where: { id: existingCloverItem.localProductId },
              data: {
                name: item.name,
                basePrice: priceInDollars,
                sku,
                updatedAt: new Date(),
              }
            });

            // Update the variant's stock
            const existingVariant = await prisma.productVariant.findFirst({
              where: { productId: product.id }
            });

            if (existingVariant) {
              await prisma.productVariant.update({
                where: { id: existingVariant.id },
                data: {
                  price: priceInDollars,
                  stock: stockCount,
                }
              });
            }
          }

          result.updated++;
          continue;
        }
      }

      // Create new records using transaction for atomicity
      await prisma.$transaction(async (tx) => {
        // Find local category by name if we have one from Clover
        let localCategoryId: string | null = null;
        if (cloverCategoryName) {
          const localCategory = await tx.category.findFirst({
            where: { name: cloverCategoryName }
          });
          localCategoryId = localCategory?.id || null;
        }

        // Check for existing Product by SKU to avoid duplicates
        let product = await tx.product.findUnique({
          where: { sku }
        });

        if (!product) {
          // Create new Product
          const baseSlug = generateSlug(item.name);
          let slug = baseSlug;
          let slugCounter = 1;

          // Ensure unique slug
          while (await tx.product.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${slugCounter++}`;
          }

          product = await tx.product.create({
            data: {
              name: item.name,
              slug,
              description: item.alternateName || '',
              sku,
              basePrice: priceInDollars,
              featured: false,
              categoryId: localCategoryId,
            }
          });
        }

        // Create ProductVariant (required for cart/orders)
        const variantSku = `${sku}-DEFAULT`;
        let variant = await tx.productVariant.findUnique({
          where: { sku: variantSku }
        });

        if (!variant) {
          variant = await tx.productVariant.create({
            data: {
              productId: product.id,
              name: 'Default',
              sku: variantSku,
              price: priceInDollars,
              stock: stockCount,
            }
          });
        } else {
          // Update existing variant stock
          variant = await tx.productVariant.update({
            where: { id: variant.id },
            data: {
              price: priceInDollars,
              stock: stockCount,
            }
          });
        }

        // Create CloverItem mirror record
        await tx.cloverItem.create({
          data: {
            configId: cloverConfig.id,
            cloverId: item.id,
            cloverItemId: item.id,
            name: item.name,
            alternateName: item.alternateName,
            sku,
            price: item.price,
            priceType: item.priceType || 'FIXED',
            unitName: item.unitName,
            stockCount,
            isStockTracked: true,
            cloverCategoryId,
            cloverCategoryName,
            taxRateIds,
            modifierGroupIds,
            isRevenue: item.isRevenue ?? true,
            isHidden: item.hidden ?? false,
            cost: costInCents,
            localProductId: product.id,
            localVariantId: variant.id,
            lastSyncedAt: new Date(),
            cloverModifiedAt: item.modifiedTime ? new Date(item.modifiedTime) : null,
          }
        });
      });

      result.imported++;
    } catch (error) {
      result.failed++;
      result.errors.push(`Item "${item.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return result;
}

// ============================================================================
// CUSTOMER IMPORT (with CloverCustomer mirror and User creation)
// ============================================================================

async function importCustomers(
  customers: CloverCustomerData[],
  options: SyncOptions,
  merchantId: string
): Promise<ImportResult> {
  const result: ImportResult = { imported: 0, skipped: 0, updated: 0, failed: 0, errors: [] };

  for (const customer of customers) {
    try {
      // Extract emails from emailAddresses array (Clover's actual format)
      const emailElements = customer.emailAddresses?.elements || [];
      const primaryEmail = emailElements.find(e => e.primaryEmail)?.emailAddress
        || emailElements[0]?.emailAddress
        || null;
      const allEmails = emailElements.map(e => e.emailAddress).filter(Boolean);

      // Extract phone numbers
      const phoneElements = customer.phoneNumbers?.elements || [];
      const allPhones = phoneElements.map(p => p.phoneNumber).filter(Boolean);

      // Check for existing CloverCustomer by cloverId
      const existingCloverCustomer = await prisma.cloverCustomer.findUnique({
        where: { cloverId: customer.id }
      });

      const customerName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Clover Customer';

      if (existingCloverCustomer) {
        if (options.skipDuplicates) {
          result.skipped++;
          continue;
        }

        if (options.updateExisting) {
          // Update CloverCustomer mirror record
          await prisma.cloverCustomer.update({
            where: { id: existingCloverCustomer.id },
            data: {
              firstName: customer.firstName,
              lastName: customer.lastName,
              emailAddresses: allEmails,
              phoneNumbers: allPhones,
              addresses: customer.addresses?.elements || [],
              marketingAllowed: customer.marketingAllowed ?? false,
              lastSyncedAt: new Date(),
            }
          });

          // Update linked User if it exists
          if (existingCloverCustomer.localUserId) {
            await prisma.user.update({
              where: { id: existingCloverCustomer.localUserId },
              data: {
                name: customerName,
              }
            });
          }

          result.updated++;
          continue;
        }
      }

      // Skip customers without email (can't create User without email)
      if (!primaryEmail) {
        result.skipped++;
        continue;
      }

      // Check for existing user by email
      const existingUser = await prisma.user.findUnique({
        where: { email: primaryEmail }
      });

      await prisma.$transaction(async (tx) => {
        let localUserId: string | null = null;

        if (existingUser) {
          localUserId = existingUser.id;
          // Update user name if needed
          if (options.updateExisting) {
            await tx.user.update({
              where: { id: existingUser.id },
              data: { name: customerName }
            });
          }
        } else {
          // Create new User with temporary password
          const tempPassword = await bcrypt.hash(`CloverUser${Date.now()}!`, 10);
          const newUser = await tx.user.create({
            data: {
              email: primaryEmail,
              password: tempPassword,
              name: customerName,
              role: 'CUSTOMER',
            }
          });
          localUserId = newUser.id;
        }

        // Create CloverCustomer mirror record
        await tx.cloverCustomer.create({
          data: {
            cloverId: customer.id,
            merchantId,
            firstName: customer.firstName,
            lastName: customer.lastName,
            emailAddresses: allEmails,
            phoneNumbers: allPhones,
            addresses: customer.addresses?.elements || [],
            marketingAllowed: customer.marketingAllowed ?? false,
            localUserId,
            cloverCreatedAt: customer.createdTime ? new Date(customer.createdTime) : null,
            lastSyncedAt: new Date(),
          }
        });
      });

      result.imported++;
    } catch (error) {
      result.failed++;
      const customerName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.id;
      result.errors.push(`Customer "${customerName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return result;
}

// ============================================================================
// ORDER IMPORT (with CloverOrder, CloverOrderLineItem, and local Order creation)
// ============================================================================

async function importOrders(
  orders: CloverOrderData[],
  options: SyncOptions,
  merchantId: string,
  apiToken: string
): Promise<ImportResult> {
  const result: ImportResult = { imported: 0, skipped: 0, updated: 0, failed: 0, errors: [] };

  const cloverConfig = await getOrCreateCloverConfig(merchantId, apiToken);

  for (const order of orders) {
    try {
      // Check for existing CloverOrder by cloverId
      const existingCloverOrder = await prisma.cloverOrder.findUnique({
        where: { cloverId: order.id }
      });

      if (existingCloverOrder) {
        if (options.skipDuplicates) {
          result.skipped++;
          continue;
        }

        if (options.updateExisting) {
          // Update CloverOrder mirror record
          await prisma.cloverOrder.update({
            where: { id: existingCloverOrder.id },
            data: {
              state: order.state,
              title: order.title,
              note: order.note,
              total: order.total || 0,
              taxAmount: order.taxAmount || 0,
              tipAmount: order.tipAmount || 0,
              discountAmount: order.discountAmount || 0,
              serviceCharge: order.serviceCharge || 0,
              cloverEmployeeId: order.employee?.id,
              employeeName: order.employee?.name,
              deviceId: order.device?.id,
              orderType: order.orderType?.label,
              paymentState: order.state === 'PAID' ? 'PAID' : 'OPEN',
              paymentIds: order.payments?.elements?.map(p => p.id) || [],
              cloverModifiedAt: order.modifiedTime ? new Date(order.modifiedTime) : null,
              lastSyncedAt: new Date(),
            }
          });
          result.updated++;
          continue;
        }
      }

      // Get customer info from Clover
      const cloverCustomerId = order.customers?.elements?.[0]?.id;
      let customerName = 'Walk-in Customer';
      let customerEmail = `clover-order-${order.id}@noemail.local`;

      if (cloverCustomerId) {
        const cloverCustomer = await prisma.cloverCustomer.findUnique({
          where: { cloverId: cloverCustomerId }
        });
        if (cloverCustomer) {
          customerName = `${cloverCustomer.firstName || ''} ${cloverCustomer.lastName || ''}`.trim() || 'Clover Customer';
          customerEmail = cloverCustomer.emailAddresses[0] || customerEmail;
        }
      }

      // Calculate subtotal (total - tax - tip + discount)
      const total = order.total || 0;
      const taxAmount = order.taxAmount || 0;
      const tipAmount = order.tipAmount || 0;
      const discountAmount = order.discountAmount || 0;
      const subtotal = total - taxAmount - tipAmount + discountAmount;

      await prisma.$transaction(async (tx) => {
        // Create CloverOrder mirror record
        const cloverOrder = await tx.cloverOrder.create({
          data: {
            configId: cloverConfig.id,
            cloverId: order.id,
            state: order.state,
            title: order.title,
            note: order.note,
            total,
            subtotal,
            taxAmount,
            tipAmount,
            discountAmount,
            serviceCharge: order.serviceCharge || 0,
            cloverCustomerId,
            customerName,
            customerEmail,
            cloverEmployeeId: order.employee?.id,
            employeeName: order.employee?.name,
            deviceId: order.device?.id,
            orderType: order.orderType?.label,
            paymentState: order.state === 'PAID' ? 'PAID' : 'OPEN',
            paymentIds: order.payments?.elements?.map(p => p.id) || [],
            cloverCreatedAt: order.createdTime ? new Date(order.createdTime) : null,
            cloverModifiedAt: order.modifiedTime ? new Date(order.modifiedTime) : null,
            lastSyncedAt: new Date(),
          }
        });

        // Create CloverOrderLineItem records
        const lineItems = order.lineItems?.elements || [];
        for (const lineItem of lineItems) {
          const itemDiscounts = lineItem.discounts?.elements || [];
          const totalDiscount = itemDiscounts.reduce((sum, d) => sum + (d.amount || 0), 0);

          await tx.cloverOrderLineItem.create({
            data: {
              orderId: cloverOrder.id,
              cloverId: lineItem.id,
              cloverItemId: lineItem.item?.id,
              name: lineItem.name,
              alternateName: lineItem.alternateName,
              price: lineItem.price,
              unitPrice: lineItem.price,
              quantity: lineItem.unitQty || 1,
              discountAmount: totalDiscount,
              modifiers: lineItem.modifications?.elements || [],
              note: lineItem.note,
              taxAmount: lineItem.taxRates?.elements?.reduce((sum, t) => sum + (t.taxAmount || 0), 0) || 0,
            }
          });
        }

        // For PAID orders, create a local Order record
        if (order.state === 'PAID' || order.state === 'LOCKED') {
          // Find local user if we have a clover customer
          let localUserId: string | null = null;
          if (cloverCustomerId) {
            const cloverCustomer = await tx.cloverCustomer.findUnique({
              where: { cloverId: cloverCustomerId }
            });
            localUserId = cloverCustomer?.localUserId || null;
          }

          const localOrder = await tx.order.create({
            data: {
              userId: localUserId,
              customerEmail,
              customerName,
              shippingAddress: 'In-Store Pickup',
              shippingCity: 'McAllen',
              shippingState: 'TX',
              shippingZip: '78504',
              shippingCountry: 'US',
              subtotal: subtotal / 100, // Convert cents to dollars
              shipping: 0,
              tax: taxAmount / 100,
              total: total / 100,
              status: 'DELIVERED', // POS orders are immediately fulfilled
              cloverOrderId: order.id,
            }
          });

          // Update CloverOrder with local order link
          await tx.cloverOrder.update({
            where: { id: cloverOrder.id },
            data: { localOrderId: localOrder.id }
          });

          // Create OrderItems for each line item
          for (const lineItem of lineItems) {
            // Try to find local variant via CloverItem
            let variantId: string | null = null;
            if (lineItem.item?.id) {
              const cloverItem = await tx.cloverItem.findUnique({
                where: { cloverId: lineItem.item.id }
              });
              variantId = cloverItem?.localVariantId || null;
            }

            // If no variant found, try to find by name or create a placeholder
            if (!variantId) {
              // Look for a product with similar name
              const product = await tx.product.findFirst({
                where: { name: { contains: lineItem.name, mode: 'insensitive' } },
                include: { variants: true }
              });
              variantId = product?.variants[0]?.id || null;
            }

            // Only create order item if we have a variant
            if (variantId) {
              await tx.orderItem.create({
                data: {
                  orderId: localOrder.id,
                  variantId,
                  quantity: lineItem.unitQty || 1,
                  price: lineItem.price / 100, // Convert cents to dollars
                }
              });
            }
          }
        }
      });

      result.imported++;
    } catch (error) {
      result.failed++;
      result.errors.push(`Order "${order.id}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return result;
}

// ============================================================================
// PAYMENT IMPORT (with CloverPayment creation)
// ============================================================================

async function importPayments(
  payments: CloverPaymentData[],
  options: SyncOptions,
  merchantId: string
): Promise<ImportResult> {
  const result: ImportResult = { imported: 0, skipped: 0, updated: 0, failed: 0, errors: [] };

  for (const payment of payments) {
    try {
      // Check for existing CloverPayment by cloverId
      const existingPayment = await prisma.cloverPayment.findUnique({
        where: { cloverId: payment.id }
      });

      if (existingPayment) {
        if (options.skipDuplicates) {
          result.skipped++;
          continue;
        }
        // Payments are generally immutable, skip update
        result.skipped++;
        continue;
      }

      // Find associated CloverOrder
      if (!payment.order?.id) {
        result.skipped++;
        continue;
      }

      const cloverOrder = await prisma.cloverOrder.findUnique({
        where: { cloverId: payment.order.id }
      });

      if (!cloverOrder) {
        // Order hasn't been imported yet, skip this payment
        result.skipped++;
        continue;
      }

      // Create CloverPayment record
      await prisma.cloverPayment.create({
        data: {
          orderId: cloverOrder.id,
          cloverId: payment.id,
          amount: payment.amount,
          tipAmount: payment.tipAmount || 0,
          taxAmount: payment.taxAmount || 0,
          tender: payment.tender?.labelKey || payment.tender?.label,
          cardType: payment.cardTransaction?.cardType,
          last4: payment.cardTransaction?.last4,
          result: payment.result,
          externalPaymentId: payment.externalPaymentId,
          cloverCreatedAt: payment.createdTime ? new Date(payment.createdTime) : null,
        }
      });

      // Update local Order payment info if linked
      if (cloverOrder.localOrderId) {
        await prisma.order.update({
          where: { id: cloverOrder.localOrderId },
          data: { cloverPaymentId: payment.id }
        });
      }

      result.imported++;
    } catch (error) {
      result.failed++;
      result.errors.push(`Payment "${payment.id}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return result;
}

// ============================================================================
// MODIFIER IMPORT (with CloverModifierGroup and CloverModifier creation)
// ============================================================================

async function importModifiers(
  modifierGroups: CloverModifierGroupData[],
  options: SyncOptions,
  merchantId: string
): Promise<ImportResult> {
  const result: ImportResult = { imported: 0, skipped: 0, updated: 0, failed: 0, errors: [] };

  for (const group of modifierGroups) {
    try {
      // Check for existing CloverModifierGroup by cloverId
      const existingGroup = await prisma.cloverModifierGroup.findUnique({
        where: { cloverId: group.id }
      });

      const itemIds = group.items?.elements?.map(i => i.id) || [];

      if (existingGroup) {
        if (options.skipDuplicates) {
          result.skipped++;
          continue;
        }

        if (options.updateExisting) {
          await prisma.cloverModifierGroup.update({
            where: { id: existingGroup.id },
            data: {
              name: group.name,
              showByDefault: group.showByDefault ?? true,
              minRequired: group.minRequired || 0,
              maxAllowed: group.maxAllowed,
              itemIds,
              lastSyncedAt: new Date(),
            }
          });

          // Update modifiers within the group
          const modifiers = group.modifiers?.elements || [];
          for (const modifier of modifiers) {
            const existingModifier = await prisma.cloverModifier.findUnique({
              where: { cloverId: modifier.id }
            });

            if (existingModifier) {
              await prisma.cloverModifier.update({
                where: { id: existingModifier.id },
                data: {
                  name: modifier.name,
                  alternateName: modifier.alternateName,
                  price: modifier.price || 0,
                  available: modifier.available ?? true,
                }
              });
            } else {
              await prisma.cloverModifier.create({
                data: {
                  groupId: existingGroup.id,
                  cloverId: modifier.id,
                  name: modifier.name,
                  alternateName: modifier.alternateName,
                  price: modifier.price || 0,
                  available: modifier.available ?? true,
                }
              });
            }
          }

          result.updated++;
          continue;
        }
      }

      // Create new modifier group with modifiers
      await prisma.$transaction(async (tx) => {
        const newGroup = await tx.cloverModifierGroup.create({
          data: {
            cloverId: group.id,
            merchantId,
            name: group.name,
            showByDefault: group.showByDefault ?? true,
            minRequired: group.minRequired || 0,
            maxAllowed: group.maxAllowed,
            itemIds,
            lastSyncedAt: new Date(),
          }
        });

        // Create modifiers
        const modifiers = group.modifiers?.elements || [];
        for (const modifier of modifiers) {
          await tx.cloverModifier.create({
            data: {
              groupId: newGroup.id,
              cloverId: modifier.id,
              name: modifier.name,
              alternateName: modifier.alternateName,
              price: modifier.price || 0,
              available: modifier.available ?? true,
            }
          });
        }
      });

      result.imported++;
    } catch (error) {
      result.failed++;
      result.errors.push(`ModifierGroup "${group.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return result;
}

// ============================================================================
// TAX RATE IMPORT (with CloverTaxRate creation)
// ============================================================================

async function importTaxRates(
  taxRates: CloverTaxRateData[],
  options: SyncOptions,
  merchantId: string
): Promise<ImportResult> {
  const result: ImportResult = { imported: 0, skipped: 0, updated: 0, failed: 0, errors: [] };

  for (const taxRate of taxRates) {
    try {
      // Check for existing CloverTaxRate by cloverId
      const existingTaxRate = await prisma.cloverTaxRate.findUnique({
        where: { cloverId: taxRate.id }
      });

      if (existingTaxRate) {
        if (options.skipDuplicates) {
          result.skipped++;
          continue;
        }

        if (options.updateExisting) {
          await prisma.cloverTaxRate.update({
            where: { id: existingTaxRate.id },
            data: {
              name: taxRate.name,
              rate: taxRate.rate,
              isDefault: taxRate.isDefault ?? false,
              taxableAmount: taxRate.taxableAmount || 'SUBTOTAL',
              lastSyncedAt: new Date(),
            }
          });
          result.updated++;
          continue;
        }
      }

      // Create new tax rate
      await prisma.cloverTaxRate.create({
        data: {
          cloverId: taxRate.id,
          merchantId,
          name: taxRate.name,
          rate: taxRate.rate,
          isDefault: taxRate.isDefault ?? false,
          taxableAmount: taxRate.taxableAmount || 'SUBTOTAL',
          lastSyncedAt: new Date(),
        }
      });

      result.imported++;
    } catch (error) {
      result.failed++;
      result.errors.push(`TaxRate "${taxRate.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return result;
}

// ============================================================================
// SYNC LOG CREATION
// ============================================================================

async function createSyncLog(
  merchantId: string,
  apiToken: string,
  syncType: string,
  results: Record<string, ImportResult>,
  startTime: Date,
  triggeredBy: string,
  userId?: string
) {
  const cloverConfig = await getOrCreateCloverConfig(merchantId, apiToken);
  const endTime = new Date();
  const durationMs = endTime.getTime() - startTime.getTime();

  // Determine overall status
  const allResults = Object.values(results);
  const totalFailed = allResults.reduce((sum, r) => sum + r.failed, 0);
  const totalImported = allResults.reduce((sum, r) => sum + r.imported + r.updated, 0);

  let status: 'COMPLETED' | 'PARTIAL' | 'FAILED' = 'COMPLETED';
  if (totalFailed > 0 && totalImported === 0) {
    status = 'FAILED';
  } else if (totalFailed > 0) {
    status = 'PARTIAL';
  }

  // Collect all errors
  const allErrors = allResults.flatMap(r => r.errors);

  await prisma.cloverSyncLog.create({
    data: {
      configId: cloverConfig.id,
      syncType,
      status,
      itemsSynced: (results.items?.imported || 0) + (results.items?.updated || 0),
      itemsCreated: results.items?.imported || 0,
      itemsUpdated: results.items?.updated || 0,
      itemsFailed: results.items?.failed || 0,
      ordersSynced: (results.orders?.imported || 0) + (results.orders?.updated || 0),
      customersSynced: (results.customers?.imported || 0) + (results.customers?.updated || 0),
      categoriesSynced: (results.categories?.imported || 0) + (results.categories?.updated || 0),
      modifiersSynced: (results.modifiers?.imported || 0) + (results.modifiers?.updated || 0),
      startedAt: startTime,
      completedAt: endTime,
      durationMs,
      errorMessage: allErrors.length > 0 ? allErrors.slice(0, 10).join('; ') : null,
      errorDetails: allErrors.length > 0 ? { errors: allErrors } : undefined,
      triggeredBy,
      userId,
    }
  });

  // Update last sync time on config
  await prisma.cloverConfig.update({
    where: { id: cloverConfig.id },
    data: { lastSyncAt: endTime }
  });
}

// ============================================================================
// MAIN POST HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  const startTime = new Date();

  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const config: CloverConfig = {
      apiToken: body.config.apiToken || process.env.CLOVER_ACCESS_TOKEN || '',
      merchantId: body.config.merchantId || process.env.CLOVER_MERCHANT_ID || '',
    };
    const { syncData, options }: {
      syncData: {
        items?: CloverItemData[];
        categories?: CloverCategoryData[];
        customers?: CloverCustomerData[];
        orders?: CloverOrderData[];
        payments?: CloverPaymentData[];
        modifiers?: CloverModifierGroupData[];
        taxRates?: CloverTaxRateData[];
      };
      options: SyncOptions;
    } = body;

    const results: Record<string, ImportResult> = {};

    // Import in correct order (dependencies first)

    // 1. Categories (no dependencies)
    if (options.importCategories && syncData.categories?.length) {
      results.categories = await importCategories(syncData.categories, options);
    }

    // 2. Tax Rates (no dependencies)
    if (options.importTaxRates && syncData.taxRates?.length) {
      results.taxRates = await importTaxRates(syncData.taxRates, options, config.merchantId);
    }

    // 3. Modifiers (no dependencies)
    if (options.importModifiers && syncData.modifiers?.length) {
      results.modifiers = await importModifiers(syncData.modifiers, options, config.merchantId);
    }

    // 4. Items/Products (depends on categories)
    if (options.importItems && syncData.items?.length) {
      results.items = await importItems(syncData.items, options, config.merchantId, config.apiToken);
    }

    // 5. Customers (no dependencies on products)
    if (options.importCustomers && syncData.customers?.length) {
      results.customers = await importCustomers(syncData.customers, options, config.merchantId);
    }

    // 6. Orders (depends on customers and items)
    if (options.importOrders && syncData.orders?.length) {
      results.orders = await importOrders(syncData.orders, options, config.merchantId, config.apiToken);
    }

    // 7. Payments (depends on orders)
    if (options.importPayments && syncData.payments?.length) {
      results.payments = await importPayments(syncData.payments, options, config.merchantId);
    }

    // Create sync log
    await createSyncLog(
      config.merchantId,
      config.apiToken,
      'full',
      results,
      startTime,
      'manual',
      session.user.id
    );

    // Calculate summary
    const summary = {
      totalImported: Object.values(results).reduce((sum, r) => sum + r.imported, 0),
      totalUpdated: Object.values(results).reduce((sum, r) => sum + r.updated, 0),
      totalSkipped: Object.values(results).reduce((sum, r) => sum + r.skipped, 0),
      totalFailed: Object.values(results).reduce((sum, r) => sum + r.failed, 0),
      errors: Object.values(results).flatMap(r => r.errors),
    };

    return NextResponse.json({
      success: true,
      results,
      summary,
      message: summary.totalFailed > 0
        ? `Import completed with ${summary.totalFailed} errors. Check details for more information.`
        : `Successfully imported ${summary.totalImported} new records and updated ${summary.totalUpdated} existing records.`
    });
  } catch (error: unknown) {
    console.error('Error importing Clover data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to import Clover data' },
      { status: 500 }
    );
  }
}
