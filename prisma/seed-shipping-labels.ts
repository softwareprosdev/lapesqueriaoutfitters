/**
 * Sample Shipping Labels Seed Script
 * 
 * Usage:
 *   npx tsx prisma/seed-shipping-labels.ts
 * 
 * Creates realistic shipping labels for testing the label printer.
 * All tracking numbers are fake/test numbers.
 */

import { PrismaClient, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || process.env.POSTGRES_URL
    }
  }
});

// Realistic shipping addresses for testing
const SAMPLE_SHIPPING_LABELS = [
  {
    orderNumber: 'SHENA-001',
    customerName: 'Maria Garcia',
    customerEmail: 'maria.garcia@email.com',
    shippingAddress: '1428 Ocean Drive, Apt 4B',
    shippingCity: 'South Padre Island',
    shippingState: 'TX',
    shippingZip: '78597',
    shippingCountry: 'US',
    items: [
      { name: 'Sea Turtle Conservation T-Shirt - Navy / M', sku: 'TSHIRT-NV-M-001', price: 29.99 },
      { name: 'Wave Pattern Bracelet - Medium', sku: 'BRACELET-WV-M-002', price: 24.99 },
    ],
  },
  {
    orderNumber: 'SHENA-002',
    customerName: 'James Thompson',
    customerEmail: 'jthompson@outlook.com',
    shippingAddress: '2567 Coastal Highway, Suite 200',
    shippingCity: 'Galveston',
    shippingState: 'TX',
    shippingZip: '77550',
    shippingCountry: 'US',
    items: [
      { name: 'Ocean Sunset T-Shirt - Coral / XL', sku: 'TSHIRT-CR-XL-003', price: 29.99 },
    ],
  },
  {
    orderNumber: 'SHENA-003',
    customerName: 'Sarah Williams',
    customerEmail: 'sarah.w@gmail.com',
    shippingAddress: '8901 Seashell Lane',
    shippingCity: 'Corpus Christi',
    shippingState: 'TX',
    shippingZip: '78401',
    shippingCountry: 'US',
    items: [
      { name: 'Dolphin Friends Bracelet - Small', sku: 'BRACELET-DF-S-004', price: 24.99 },
      { name: 'Marine Life T-Shirt - White / L', sku: 'TSHIRT-WH-L-005', price: 29.99 },
      { name: 'Starfish Anklet - Medium', sku: 'ANKLET-SF-M-006', price: 19.99 },
    ],
  },
  {
    orderNumber: 'SHENA-004',
    customerName: 'Michael Rodriguez',
    customerEmail: 'mike.r@yahoo.com',
    shippingAddress: '3456 Beach Boulevard',
    shippingCity: 'Rockport',
    shippingState: 'TX',
    shippingZip: '78382',
    shippingCountry: 'US',
    items: [
      { name: 'Whale Tail Pendant - Gold', sku: 'PENDANT-WT-G-007', price: 45.00 },
    ],
  },
  {
    orderNumber: 'SHENA-005',
    customerName: 'Jennifer Lee',
    customerEmail: 'jen.lee@comcast.net',
    shippingAddress: '789 Windward Way',
    shippingCity: 'Port Aransas',
    shippingState: 'TX',
    shippingZip: '78373',
    shippingCountry: 'US',
    items: [
      { name: 'Sea Glass T-Shirt - Seafoam / S', sku: 'TSHIRT-SF-S-008', price: 29.99 },
      { name: 'Coral Reef Bracelet - Large', sku: 'BRACELET-CR-L-009', price: 24.99 },
    ],
  },
  {
    orderNumber: 'SHENA-006',
    customerName: 'Robert Chen',
    customerEmail: 'rchen@utexas.edu',
    shippingAddress: '101 University Drive, Dorm A Room 214',
    shippingCity: 'Austin',
    shippingState: 'TX',
    shippingZip: '78712',
    shippingCountry: 'US',
    items: [
      { name: 'Shark Week T-Shirt - Navy / M', sku: 'TSHIRT-NV-M-010', price: 29.99 },
    ],
  },
  {
    orderNumber: 'SHENA-007',
    customerName: 'Amanda Foster',
    customerEmail: 'amanda.foster@live.com',
    shippingAddress: '555 Marina Bay Drive, Unit 12C',
    shippingCity: 'Houston',
    shippingState: 'TX',
    shippingZip: '77001',
    shippingCountry: 'US',
    items: [
      { name: 'Ocean Conservation Tote Bag', sku: 'TOTE-OC-011', price: 18.99 },
      { name: 'Manatee Memory Bracelet', sku: 'BRACELET-MM-012', price: 24.99 },
      { name: 'Beach Vibes T-Shirt - Yellow / M', sku: 'TSHIRT-YL-M-013', price: 29.99 },
    ],
  },
  {
    orderNumber: 'SHENA-008',
    customerName: 'David Kim',
    customerEmail: 'dkim@amazon.com',
    shippingAddress: '2020 Technology Ridge Blvd',
    shippingCity: 'Dallas',
    shippingState: 'TX',
    shippingZip: '75201',
    shippingCountry: 'US',
    items: [
      { name: 'Deep Sea Diver T-Shirt - Black / XL', sku: 'TSHIRT-BK-XL-014', price: 29.99 },
    ],
  },
  {
    orderNumber: 'SHENA-009',
    customerName: 'Lisa Anderson',
    customerEmail: 'lisa.a@gmail.com',
    shippingAddress: '789 Palm Beach Road, PO Box 456',
    shippingCity: 'South Padre Island',
    shippingState: 'TX',
    shippingZip: '78597',
    shippingCountry: 'US',
    items: [
      { name: 'Sunset Over Ocean T-Shirt - Orange / S', sku: 'TSHIRT-OR-S-015', price: 29.99 },
      { name: 'Nautical Star Bracelet', sku: 'BRACELET-NS-016', price: 24.99 },
      { name: 'Sea Turtle Stretch Bracelet', sku: 'BRACELET-ST-017', price: 22.99 },
    ],
  },
  {
    orderNumber: 'SHENA-010',
    customerName: 'Carlos Mendez',
    customerEmail: 'carlos.mendez@att.net',
    shippingAddress: '314159 E. Main Street',
    shippingCity: 'Laredo',
    shippingState: 'TX',
    shippingZip: '78040',
    shippingCountry: 'US',
    items: [
      { name: 'Adventure Awaits T-Shirt - Navy / L', sku: 'TSHIRT-NV-L-018', price: 29.99 },
    ],
  },
  {
    orderNumber: 'SHENA-011',
    customerName: 'Emily Watson',
    customerEmail: 'emily.watson@protonmail.com',
    shippingAddress: '2468 Lighthouse Court',
    shippingCity: 'Freeport',
    shippingState: 'TX',
    shippingZip: '77541',
    shippingCountry: 'US',
    items: [
      { name: 'Mermaid Scales T-Shirt - Teal / M', sku: 'TSHIRT-TE-M-019', price: 29.99 },
      { name: 'Pearl and Shell Anklet', sku: 'ANKLET-PS-020', price: 19.99 },
    ],
  },
  {
    orderNumber: 'SHENA-012',
    customerName: 'Thomas Wright',
    customerEmail: 'tom.wright@icloud.com',
    shippingAddress: '999 Coastal Research Center',
    shippingCity: 'Port Isabel',
    shippingState: 'TX',
    shippingZip: '78578',
    shippingCountry: 'US',
    items: [
      { name: 'Marine Biologist T-Shirt - White / XL', sku: 'TSHIRT-WH-XL-021', price: 29.99 },
      { name: 'Shark Tooth Pendant', sku: 'PENDANT-ST-022', price: 35.00 },
    ],
  },
];

// Generate realistic tracking numbers
function generateUSPSTracking(): string {
  // USPS tracking format: 9400 + 16 digits
  return '9400' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('');
}

function generateFedExTracking(): string {
  // FedEx tracking format: 12 digits starting with 7489
  return '7489' + Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
}

function generateUPSTracking(): string {
  // UPS tracking format: 1Z + 16 alphanumeric
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return '1Z' + Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

async function main() {
  console.log('🚀 Creating realistic shipping labels for label printer testing...\n');

  const carriers = ['USPS', 'FedEx', 'UPS'];
  const services: Record<string, string[]> = {
    USPS: ['Priority Mail', 'Priority Mail Express', 'Ground Advantage', 'First Class Mail'],
    FedEx: ['Ground', 'Express Saver', '2Day', 'Overnight'],
    UPS: ['Ground', '3 Day Select', '2nd Day Air', 'Next Day Air'],
  };

  let created = 0;
  let skipped = 0;

  for (const orderData of SAMPLE_SHIPPING_LABELS) {
    try {
      // Check if order exists
      const existingOrder = await prisma.order.findFirst({
        where: { orderNumber: orderData.orderNumber }
      });

      let orderId: string;

      if (existingOrder) {
        orderId = existingOrder.id;
        console.log(`⏭️  Order ${orderData.orderNumber} exists, creating label only...`);
      } else {
        // Create order
        const order = await prisma.order.create({
          data: {
            orderNumber: orderData.orderNumber,
            customerEmail: orderData.customerEmail,
            customerName: orderData.customerName,
            shippingAddress: orderData.shippingAddress,
            shippingCity: orderData.shippingCity,
            shippingState: orderData.shippingState,
            shippingZip: orderData.shippingZip,
            shippingCountry: orderData.shippingCountry,
            subtotal: orderData.items.reduce((sum, item) => sum + item.price, 0),
            shipping: orderData.items.length > 2 ? 0 : 5.95,
            tax: orderData.items.reduce((sum, item) => sum + item.price, 0) * 0.0825,
            total: orderData.items.reduce((sum, item) => sum + item.price, 0) + (orderData.items.length > 2 ? 0 : 5.95),
            status: 'PROCESSING' as OrderStatus,
          }
        });
        orderId = order.id;

        // Create order items (skip variant creation to avoid errors)
        console.log(`✅ Created order: ${orderData.orderNumber}`);
      }

      // Check if label already exists
      const existingLabel = await prisma.shippingLabel.findFirst({
        where: { orderId }
      });

      if (existingLabel) {
        console.log(`   ⏭️  Shipping label already exists for ${orderData.orderNumber}`);
        skipped++;
        continue;
      }

      // Create shipping label with random carrier
      const carrier = carriers[Math.floor(Math.random() * carriers.length)];
      const service = services[carrier][Math.floor(Math.random() * services[carrier].length)];
      
      let trackingNumber: string;
      if (carrier === 'USPS') {
        trackingNumber = generateUSPSTracking();
      } else if (carrier === 'FedEx') {
        trackingNumber = generateFedExTracking();
      } else {
        trackingNumber = generateUPSTracking();
      }

      // Calculate shipping cost based on carrier and service
      const costs: Record<string, number> = {
        'USPS Priority Mail': 8.95,
        'USPS Priority Mail Express': 26.35,
        'USPS Ground Advantage': 5.50,
        'USPS First Class Mail': 4.50,
        'FedEx Ground': 9.50,
        'FedEx Express Saver': 15.95,
        'FedEx 2Day': 24.95,
        'FedEx Overnight': 45.00,
        'UPS Ground': 11.50,
        'UPS 3 Day Select': 18.95,
        'UPS 2nd Day Air': 28.95,
        'UPS Next Day Air': 55.00,
      };

      const cost = costs[service] || 8.95;
      const weight = 0.25 + (orderData.items.length * 0.15); // 0.4-0.7 lbs typical

      await prisma.shippingLabel.create({
        data: {
          orderId,
          carrier,
          service,
          trackingNumber,
          labelUrl: `https://shennastudio.com/labels/${orderData.orderNumber}.pdf`,
          cost,
          status: 'created',
          weight,
          length: 12,
          width: 9,
          height: orderData.items.length > 2 ? 4 : 2,
        }
      });

      console.log(`   📦 ${carrier} ${service}: ${trackingNumber} ($${cost.toFixed(2)}, ${weight.toFixed(2)} lbs)`);
      created++;

    } catch (error) {
      console.error(`❌ Error creating ${orderData.orderNumber}:`, error);
    }
  }

  console.log('\n🎉 Shipping labels ready for testing!');
  console.log(`   📦 Created: ${created} labels`);
  console.log(`   ⏭️  Skipped: ${skipped} (already exist)`);
  console.log('\n💡 All labels use TEST tracking numbers for label printer testing.');
  console.log('   Labels are ready to print from the admin panel.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
