import { z } from 'zod';

export const productCSVSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  basePrice: z.number().positive(),
  categorySlug: z.string().optional(),
  images: z.string().optional(), // comma-separated URLs
  conservationPercentage: z.number().min(0).max(100).optional(),
  conservationFocus: z.string().optional(),
  featured: z.boolean().optional(),
  // Variant data
  variantName: z.string().optional(),
  variantSku: z.string().optional(),
  variantPrice: z.number().positive().optional(),
  variantStock: z.number().int().min(0).optional(),
  variantSize: z.string().optional(),
  variantColor: z.string().optional(),
  variantMaterial: z.string().optional(),
});

export type ProductCSVRow = z.infer<typeof productCSVSchema>;

export function parseCSV(csvText: string): ProductCSVRow[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  const headers = lines[0].split(',').map((h) => h.trim());
  const rows: ProductCSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const row: Record<string, string | number | boolean | undefined> = {};

    headers.forEach((header, index) => {
      const value = values[index];

      // Parse boolean
      if (header === 'featured') {
        row[header] = value.toLowerCase() === 'true';
      }
      // Parse numbers
      else if (
        ['basePrice', 'conservationPercentage', 'variantPrice', 'variantStock'].includes(header)
      ) {
        row[header] = value ? parseFloat(value) : undefined;
      }
      // Parse strings
      else {
        row[header] = value || undefined;
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rows.push(row as any);
  }

  return rows;
}

export function validateProductRows(rows: ProductCSVRow[]): {
  valid: ProductCSVRow[];
  invalid: { row: number; errors: string[] }[];
} {
  const valid: ProductCSVRow[] = [];
  const invalid: { row: number; errors: string[] }[] = [];

  rows.forEach((row, index) => {
    const result = productCSVSchema.safeParse(row);
    if (result.success) {
      valid.push(result.data);
    } else {
      invalid.push({
        row: index + 2, // +2 because index starts at 0 and we skip header
        errors: result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`),
      });
    }
  });

  return { valid, invalid };
}

export function groupProductsBySlug(rows: ProductCSVRow[]): Map<string, ProductCSVRow[]> {
  const grouped = new Map<string, ProductCSVRow[]>();

  rows.forEach((row) => {
    const existing = grouped.get(row.slug) || [];
    existing.push(row);
    grouped.set(row.slug, existing);
  });

  return grouped;
}
