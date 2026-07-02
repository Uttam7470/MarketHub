import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/products?category=&brand=&search=&page=&limit=&sort=&featured=&vendorId=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sort = searchParams.get('sort') || 'newest';
    const featured = searchParams.get('featured') === 'true';
    const vendorId = searchParams.get('vendorId');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    const where: Record<string, unknown> = { isActive: true };

    if (category) {
      where.category = { slug: category };
    }
    if (brand) {
      where.brand = { slug: brand };
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { shortDescription: { contains: search } },
      ];
    }
    if (featured) {
      where.isFeatured = true;
    }
    if (vendorId) {
      where.vendorId = vendorId;
    }
    if (minPrice || maxPrice) {
      where.price = {} as Record<string, number>;
      if (minPrice) (where.price as Record<string, number>).gte = parseFloat(minPrice);
      if (maxPrice) (where.price as Record<string, number>).lte = parseFloat(maxPrice);
    }

    const orderBy: Record<string, string> = {};
    switch (sort) {
      case 'price-asc': orderBy.price = 'asc'; break;
      case 'price-desc': orderBy.price = 'desc'; break;
      case 'rating': orderBy.rating = 'desc'; break;
      case 'popular': orderBy.totalSold = 'desc'; break;
      default: orderBy.createdAt = 'desc';
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          vendor: { select: { id: true, businessName: true, slug: true } },
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { sortOrder: 'asc' } },
          variants: true,
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch products';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/products - Create product (vendor)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const product = await db.product.create({
      data: {
        ...body,
        slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        images: body.images ? { create: body.images } : undefined,
        variants: body.variants ? { create: body.variants } : undefined,
        specs: body.specs ? { create: body.specs } : undefined,
      },
      include: { vendor: true, category: true, brand: true, images: true, variants: true, specs: true },
    });
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create product';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT /api/products - Update product
export async function PUT(req: NextRequest) {
  try {
    const { id, ...data } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });

    const { images, variants, specs, categoryId, brandId, ...rest } = data;
    const product = await db.product.update({
      where: { id },
      data: { ...rest, ...(categoryId && { categoryId }), ...(brandId && { brandId }) },
      include: { vendor: true, category: true, brand: true, images: true, variants: true, specs: true },
    });
    return NextResponse.json({ success: true, data: product });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update product';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE /api/products?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });

    await db.productImage.deleteMany({ where: { productId: id } });
    await db.productVariant.deleteMany({ where: { productId: id } });
    await db.productSpec.deleteMany({ where: { productId: id } });
    await db.product.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete product';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}