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

    // Validate required foreign keys exist
    if (!body.vendorId) {
      return NextResponse.json({ success: false, error: 'Vendor ID is required. Please ensure your vendor account is set up.' }, { status: 400 });
    }
    if (!body.categoryId) {
      return NextResponse.json({ success: false, error: 'Category is required. Please select a category.' }, { status: 400 });
    }

    const [vendorExists, categoryExists] = await Promise.all([
      db.vendor.count({ where: { id: body.vendorId } }),
      db.category.count({ where: { id: body.categoryId } }),
    ]);

    if (!vendorExists) {
      return NextResponse.json({ success: false, error: 'Vendor account not found. Please contact support.' }, { status: 400 });
    }
    if (!categoryExists) {
      return NextResponse.json({ success: false, error: 'Selected category does not exist. Please choose a valid category.' }, { status: 400 });
    }
    if (body.brandId) {
      const brandExists = await db.brand.count({ where: { id: body.brandId } });
      if (!brandExists) {
        return NextResponse.json({ success: false, error: 'Selected brand does not exist. Please choose a valid brand.' }, { status: 400 });
      }
    }

    const product = await db.product.create({
      data: {
        vendorId: body.vendorId,
        categoryId: body.categoryId,
        brandId: body.brandId || null,
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        description: body.description || null,
        shortDescription: body.shortDescription || null,
        sku: body.sku || null,
        barcode: body.barcode || null,
        price: body.price,
        compareAtPrice: body.compareAtPrice ?? null,
        costPrice: body.costPrice ?? null,
        stock: body.stock ?? 0,
        lowStockAlert: body.lowStockAlert ?? 5,
        weight: body.weight ?? null,
        length: body.length ?? null,
        width: body.width ?? null,
        height: body.height ?? null,
        warranty: body.warranty ?? null,
        returnPolicy: body.returnPolicy ?? null,
        shippingCost: body.shippingCost ?? 0,
        isFeatured: body.isFeatured ?? false,
        isActive: body.isActive ?? true,
        productStatus: body.productStatus || 'PUBLISHED',
        badge: body.badge || null,
        estimatedDeliveryDays: body.estimatedDeliveryDays ?? 7,
        seoTitle: body.seoTitle || null,
        seoDescription: body.seoDescription || null,
        seoKeywords: body.seoKeywords || null,
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
    const { id, images, variants, specs, categoryId, brandId, ...rest } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });

    // Update images if provided: delete old, create new
    if (images && Array.isArray(images)) {
      await db.productImage.deleteMany({ where: { productId: id } });
      await db.productImage.createMany({ data: images.map((img: { url: string; alt?: string; sortOrder: number }) => ({ productId: id, url: img.url, alt: img.alt || '', sortOrder: img.sortOrder })) });
    }

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