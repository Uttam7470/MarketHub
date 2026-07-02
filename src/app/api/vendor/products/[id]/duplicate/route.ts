import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/vendor/products/[id]/duplicate - Duplicate a product
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { vendorId } = await req.json();

    const product = await db.product.findUnique({
      where: { id },
      include: { images: true, variants: true, specs: true },
    });

    if (!product) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    if (vendorId && product.vendorId !== vendorId) {
      return NextResponse.json({ success: false, error: 'Not your product' }, { status: 403 });
    }

    // Create duplicated product
    const duplicated = await db.product.create({
      data: {
        vendorId: product.vendorId,
        categoryId: product.categoryId,
        brandId: product.brandId,
        name: `${product.name} (Copy)`,
        slug: `${product.slug}-copy-${Date.now().toString(36)}`,
        description: product.description,
        shortDescription: product.shortDescription,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        costPrice: product.costPrice,
        stock: 0,
        lowStockAlert: product.lowStockAlert,
        weight: product.weight,
        length: product.length,
        width: product.width,
        height: product.height,
        warranty: product.warranty,
        returnPolicy: product.returnPolicy,
        shippingCost: product.shippingCost,
        estimatedDeliveryDays: product.estimatedDeliveryDays,
        productStatus: 'DRAFT',
      },
    });

    // Copy images
    for (const img of product.images) {
      await db.productImage.create({
        data: {
          productId: duplicated.id,
          url: img.url,
          alt: img.alt,
          sortOrder: img.sortOrder,
        },
      });
    }

    // Copy variants
    for (const variant of product.variants) {
      await db.productVariant.create({
        data: {
          productId: duplicated.id,
          name: variant.name,
          value: variant.value,
          price: variant.price,
          stock: 0,
          sku: variant.sku,
        },
      });
    }

    // Copy specs
    for (const spec of product.specs) {
      await db.productSpec.create({
        data: {
          productId: duplicated.id,
          key: spec.key,
          value: spec.value,
        },
      });
    }

    const result = await db.product.findUnique({
      where: { id: duplicated.id },
      include: { images: true, variants: true, specs: true },
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to duplicate product';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}