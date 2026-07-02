import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vendorId, products } = body;

    if (!vendorId || !products || !Array.isArray(products)) {
      return NextResponse.json({ success: false, error: 'vendorId and products array are required' }, { status: 400 });
    }

    let imported = 0;
    let failed = 0;

    // Get first category as default
    const defaultCategory = await db.category.findFirst();

    for (const p of products) {
      try {
        if (!p.name || !p.price) { failed++; continue; }

        const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now() + Math.random().toString(36).slice(2, 6);

        await db.product.create({
          data: {
            vendorId,
            name: p.name,
            slug,
            description: p.description || '',
            shortDescription: p.description?.slice(0, 200) || null,
            price: Number(p.price) || 0,
            compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
            stock: Number(p.stock) || 0,
            sku: p.sku || null,
            categoryId: p.categoryId || defaultCategory?.id || '',
            weight: p.weight ? Number(p.weight) : null,
            productStatus: 'PUBLISHED',
            isActive: true,
          },
        });
        imported++;
      } catch {
        failed++;
      }
    }

    return NextResponse.json({ success: true, data: { imported, failed, total: products.length } });
  } catch (error: any) {
    console.error('Bulk import error:', error);
    return NextResponse.json({ success: false, error: 'Failed to import products' }, { status: 500 });
  }
}