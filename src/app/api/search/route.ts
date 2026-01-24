import { NextRequest, NextResponse } from 'next/server';
import { searchProducts, type SearchFilters } from '@/lib/search';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse filters from query params
    const filters: SearchFilters = {
      query: searchParams.get('q') || undefined,
      category: searchParams.get('category') || undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      colors: searchParams.get('colors')?.split(',').filter(Boolean) || undefined,
      materials: searchParams.get('materials')?.split(',').filter(Boolean) || undefined,
      sizes: searchParams.get('sizes')?.split(',').filter(Boolean) || undefined,
      inStockOnly: searchParams.get('inStock') === 'true',
      featured: searchParams.get('featured') === 'true',
      sortBy: (searchParams.get('sort') as SearchFilters['sortBy']) || 'newest',
    };

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const results = await searchProducts(filters, page, limit);

    return NextResponse.json(results);
  } catch (error: unknown) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 }
    );
  }
}
