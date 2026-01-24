import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'pdf';
    const dateRange = searchParams.get('dateRange') || '30';
    const filter = searchParams.get('filter') || 'all';
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'all';

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(dateRange));

    // Build where clause
    const where: Record<string, unknown> = {};

    if (filter === 'low_stock') {
      where.stock = { lte: 10, gt: 0 };
    } else if (filter === 'out_of_stock') {
      where.stock = 0;
    }

    if (search) {
      where.OR = [
        { product: { name: { contains: search, mode: 'insensitive' } } },
        { sku: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category !== 'all') {
      where.product = {
        ...(where.product as Record<string, unknown>),
        category: { name: category }
      };
    }

    // Get inventory data
    const variants = await prisma.productVariant.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: { select: { name: true } },
          },
        },
      },
      orderBy: { stock: 'asc' },
    });

    // Get recent transactions within date range
    const transactions = await prisma.inventoryTransaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        variant: {
          include: {
            product: { select: { name: true } },
          },
        },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate summary
    const summary = {
      totalVariants: variants.length,
      totalStock: variants.reduce((sum, v) => sum + v.stock, 0),
      stockValue: variants.reduce((sum, v) => sum + v.price * v.stock, 0),
      lowStockCount: variants.filter(v => v.stock <= 10 && v.stock > 0).length,
      outOfStockCount: variants.filter(v => v.stock === 0).length,
      generatedAt: new Date().toISOString(),
      dateRange: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
    };

    if (format === 'excel') {
      // Generate Excel/CSV
      const csvHeaders = [
        'Product Name',
        'Variant',
        'SKU',
        'Stock Level',
        'Price',
        'Value',
        'Category'
      ];

      const csvData = variants.map(variant => [
        variant.product.name,
        variant.name,
        variant.sku,
        variant.stock.toString(),
        variant.price.toFixed(2),
        (variant.price * variant.stock).toFixed(2),
        variant.product.category?.name || 'N/A'
      ]);

      const csvContent = [csvHeaders, ...csvData]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=inventory-${new Date().toISOString().split('T')[0]}.csv`
        }
      });
    }

    // Generate PDF
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text("La Pesqueria Outfitters Inventory Report", 20, 20);

    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 35);
    doc.text(`Period: ${summary.dateRange}`, 20, 45);

    // Summary
    doc.setFontSize(14);
    doc.text('Summary', 20, 65);

    doc.setFontSize(10);
    const summaryData = [
      ['Total Variants', summary.totalVariants.toString()],
      ['Total Stock', summary.totalStock.toString()],
      ['Stock Value', `$${summary.stockValue.toFixed(2)}`],
      ['Low Stock Items', summary.lowStockCount.toString()],
      ['Out of Stock', summary.outOfStockCount.toString()],
    ];

    (doc as any).autoTable({ // eslint-disable-line @typescript-eslint/no-explicit-any
      startY: 75,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [46, 125, 50] },
    });

    // Inventory Table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let yPos = (doc as any).lastAutoTable.finalY + 20;

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.text('Inventory Details', 20, yPos);
    yPos += 10;

    const inventoryData = variants.map(variant => [
      variant.product.name,
      variant.name,
      variant.sku,
      variant.stock.toString(),
      `$${variant.price.toFixed(2)}`,
      `$${(variant.price * variant.stock).toFixed(2)}`,
      variant.product.category?.name || 'N/A'
    ]);

    (doc as any).autoTable({ // eslint-disable-line @typescript-eslint/no-explicit-any
      startY: yPos,
      head: [['Product', 'Variant', 'SKU', 'Stock', 'Price', 'Value', 'Category']],
      body: inventoryData,
      theme: 'striped',
      styles: { fontSize: 7 },
      headStyles: { fillColor: [25, 118, 210] },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 25 },
        2: { cellWidth: 20 },
        3: { cellWidth: 15 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 25 },
      },
    });

    // Recent Transactions
    if (transactions.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      yPos = (doc as any).lastAutoTable.finalY + 20;

      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.text('Recent Transactions', 20, yPos);
      yPos += 10;

      const transactionData = transactions.slice(0, 50).map(tx => [
        new Date(tx.createdAt).toLocaleDateString(),
        tx.variant.product.name,
        tx.variant.name,
        tx.type,
        tx.quantity.toString(),
        tx.notes || '',
        tx.user?.name || tx.user?.email || 'System'
      ]);

      (doc as any).autoTable({ // eslint-disable-line @typescript-eslint/no-explicit-any
        startY: yPos,
        head: [['Date', 'Product', 'Variant', 'Type', 'Qty', 'Notes', 'User']],
        body: transactionData,
        theme: 'striped',
        styles: { fontSize: 6 },
        headStyles: { fillColor: [255, 152, 0] },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 35 },
          2: { cellWidth: 20 },
          3: { cellWidth: 15 },
          4: { cellWidth: 10 },
          5: { cellWidth: 30 },
          6: { cellWidth: 25 },
        },
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} of ${pageCount} - La Pesqueria Outfitters Inventory Report`,
        20,
        doc.internal.pageSize.height - 10
      );
    }

    const pdfBuffer = doc.output('arraybuffer');

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=inventory-report-${new Date().toISOString().split('T')[0]}.pdf`
      }
    });

  } catch (error) {
    console.error('Inventory export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate inventory report' },
      { status: 500 }
    );
  }
}