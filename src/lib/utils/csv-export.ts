/**
 * CSV Export Utility
 * Provides functions to export data to CSV format
 */

/**
 * Convert an array of objects to CSV format
 */
export function arrayToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: Array<{ key: keyof T; header: string }>
): string {
  if (data.length === 0) return '';

  const headers = columns.map(col => col.header).join(',');
  const rows = data.map(row => {
    return columns.map(col => {
      const value = row[col.key];
      
      // Handle different value types
      if (value === null || value === undefined) {
        return '';
      }
      
      if (typeof value === 'string') {
        // Escape quotes and wrap in quotes if contains comma or quotes
        const escaped = value.replace(/"/g, '""');
        if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
          return `"${escaped}"`;
        }
        return escaped;
      }
      
      if (typeof value === 'number') {
        return value.toString();
      }
      
      if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
      }
      
      if (value instanceof Date) {
        return value.toISOString();
      }
      
      // Handle objects (JSON stringify if complex)
      if (typeof value === 'object') {
        const jsonStr = JSON.stringify(value);
        const escaped = jsonStr.replace(/"/g, '""');
        return `"${escaped}"`;
      }
      
      return String(value);
    }).join(',');
  });

  return [headers, ...rows].join('\n');
}

/**
 * Download data as a CSV file
 */
export function downloadCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: Array<{ key: keyof T; header: string }>,
  filename: string
): void {
  const csv = arrayToCSV(data, columns);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  // Create filename with date
  const date = new Date().toISOString().split('T')[0];
  const baseFilename = filename.toLowerCase().replace(/\s+/g, '-');
  const fullFilename = `${baseFilename}-${date}.csv`;
  
  // Create download link
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', fullFilename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Export products to CSV format
 */
export function exportProductsToCSV(products: Array<{
  id: string;
  name: string;
  sku: string;
  description: string | null;
  basePrice: number;
  category: string | null;
  conservationPercentage: number;
  featured: boolean;
  variantsCount: number;
  totalStock: number;
  createdAt: Date;
}>): void {
  downloadCSV(products, [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Product Name' },
    { key: 'sku', header: 'SKU' },
    { key: 'description', header: 'Description' },
    { key: 'basePrice', header: 'Base Price' },
    { key: 'category', header: 'Category' },
    { key: 'conservationPercentage', header: 'Conservation %' },
    { key: 'featured', header: 'Featured' },
    { key: 'variantsCount', header: 'Variants Count' },
    { key: 'totalStock', header: 'Total Stock' },
    { key: 'createdAt', header: 'Created At' },
  ], 'products');
}

/**
 * Export orders to CSV format
 */
export function exportOrdersToCSV(orders: Array<{
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  trackingNumber: string | null;
  carrier: string | null;
  createdAt: Date;
}>): void {
  downloadCSV(orders, [
    { key: 'id', header: 'ID' },
    { key: 'orderNumber', header: 'Order Number' },
    { key: 'customerName', header: 'Customer Name' },
    { key: 'customerEmail', header: 'Customer Email' },
    { key: 'status', header: 'Status' },
    { key: 'subtotal', header: 'Subtotal' },
    { key: 'shipping', header: 'Shipping' },
    { key: 'tax', header: 'Tax' },
    { key: 'total', header: 'Total' },
    { key: 'trackingNumber', header: 'Tracking Number' },
    { key: 'carrier', header: 'Carrier' },
    { key: 'createdAt', header: 'Created At' },
  ], 'orders');
}

/**
 * Export customers to CSV format
 */
export function exportCustomersToCSV(customers: Array<{
  id: string;
  name: string | null;
  email: string;
  role: string;
  orderCount: number;
  totalSpent: number;
  avgOrderValue: number;
  rewardPoints: number;
  tier: string;
  lastOrderDate: Date | null;
  createdAt: Date;
}>): void {
  downloadCSV(customers, [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    { key: 'orderCount', header: 'Order Count' },
    { key: 'totalSpent', header: 'Total Spent' },
    { key: 'avgOrderValue', header: 'Avg Order Value' },
    { key: 'rewardPoints', header: 'Reward Points' },
    { key: 'tier', header: 'Tier' },
    { key: 'lastOrderDate', header: 'Last Order Date' },
    { key: 'createdAt', header: 'Created At' },
  ], 'customers');
}

/**
 * Export inventory to CSV format
 */
export function exportInventoryToCSV(inventory: Array<{
  id: string;
  sku: string;
  productName: string;
  variantName: string;
  size: string | null;
  color: string | null;
  material: string | null;
  price: number;
  stock: number;
  status: string;
  category: string | null;
}>): void {
  downloadCSV(inventory, [
    { key: 'id', header: 'ID' },
    { key: 'sku', header: 'SKU' },
    { key: 'productName', header: 'Product Name' },
    { key: 'variantName', header: 'Variant Name' },
    { key: 'size', header: 'Size' },
    { key: 'color', header: 'Color' },
    { key: 'material', header: 'Material' },
    { key: 'price', header: 'Price' },
    { key: 'stock', header: 'Stock' },
    { key: 'status', header: 'Status' },
    { key: 'category', header: 'Category' },
  ], 'inventory');
}
