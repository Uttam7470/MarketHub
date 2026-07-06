import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/coupons/validate
// Validates a coupon against cart items and returns the discount amount
export async function POST(req: NextRequest) {
  try {
    const { code, cartItems } = await req.json();

    if (!code || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
    }

    const coupon = await db.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: { vendor: { select: { id: true, businessName: true } } },
    });

    if (!coupon) {
      return NextResponse.json({ success: false, error: 'Invalid coupon code' });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ success: false, error: 'This coupon is no longer active' });
    }

    const now = new Date();
    if (now < coupon.startDate) {
      return NextResponse.json({ success: false, error: 'This coupon is not yet active' });
    }
    if (now > coupon.endDate) {
      return NextResponse.json({ success: false, error: 'This coupon has expired' });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ success: false, error: 'This coupon has reached its usage limit' });
    }

    // Calculate eligible subtotal based on coupon scope
    let eligibleSubtotal = 0;

    if (coupon.scope === 'PLATFORM') {
      if (coupon.applicableType === 'ALL') {
        eligibleSubtotal = cartItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
      } else if (coupon.applicableType === 'CATEGORY') {
        const allowedCategories: string[] = coupon.categoryIds ? JSON.parse(coupon.categoryIds) : [];
        // For category-based, we need product category info — fall back to all if no categories
        if (allowedCategories.length === 0) {
          eligibleSubtotal = cartItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
        } else {
          // Fetch product categories for cart items
          const productIds = cartItems.map((i: any) => i.productId);
          const products = await db.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, categoryId: true },
          });
          const productCategoryMap: Record<string, string> = {};
          products.forEach((p: any) => { productCategoryMap[p.id] = p.categoryId; });
          cartItems.forEach((item: any) => {
            if (productCategoryMap[item.productId] && allowedCategories.includes(productCategoryMap[item.productId])) {
              eligibleSubtotal += item.price * item.quantity;
            }
          });
        }
      } else {
        eligibleSubtotal = cartItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
      }
    } else if (coupon.scope === 'VENDOR') {
      // Vendor coupon — only applies to that vendor's products
      cartItems.forEach((item: any) => {
        if (item.vendorId === coupon.vendorId) {
          eligibleSubtotal += item.price * item.quantity;
        }
      });

      if (eligibleSubtotal === 0) {
        return NextResponse.json({ success: false, error: `This coupon only applies to ${coupon.vendor?.businessName || "this vendor's"} products` });
      }
    }

    const subtotal = cartItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

    if (coupon.minOrder && subtotal < coupon.minOrder) {
      return NextResponse.json({ success: false, error: `Minimum order of ₹${coupon.minOrder} required for this coupon` });
    }

    if (eligibleSubtotal === 0) {
      return NextResponse.json({ success: false, error: 'No eligible items in cart for this coupon' });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (eligibleSubtotal * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }

    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }

    return NextResponse.json({
      success: true,
      data: {
        id: coupon.id,
        code: coupon.code,
        discount,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount,
        eligibleSubtotal,
        scope: coupon.scope,
        vendorName: coupon.vendor?.businessName || null,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Validation failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}