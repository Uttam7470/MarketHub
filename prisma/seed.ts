import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const db = new PrismaClient();

const CATEGORIES = [
  { name: 'Electronics', slug: 'electronics', description: 'Latest electronic gadgets and devices' },
  { name: 'Mobiles', slug: 'mobiles', parentId: null, description: 'Smartphones and accessories' },
  { name: 'Laptops', slug: 'laptops', description: 'Laptops and notebooks' },
  { name: 'Accessories', slug: 'accessories', description: 'Electronic accessories' },
  { name: 'Fashion', slug: 'fashion', description: 'Fashion and clothing' },
  { name: 'Men', slug: 'men', description: "Men's fashion" },
  { name: 'Women', slug: 'women', description: "Women's fashion" },
  { name: 'Kids', slug: 'kids', description: "Kids' fashion" },
  { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Home and kitchen essentials' },
  { name: 'Furniture', slug: 'furniture', description: 'Home furniture' },
  { name: 'Appliances', slug: 'appliances', description: 'Home appliances' },
  { name: 'Sports', slug: 'sports', description: 'Sports and fitness' },
  { name: 'Books', slug: 'books', description: 'Books and publications' },
  { name: 'Beauty', slug: 'beauty', description: 'Beauty and personal care' },
];

const BRANDS = [
  { name: 'TechPro', slug: 'techpro' },
  { name: 'StyleWear', slug: 'stylewear' },
  { name: 'HomeEssentials', slug: 'homeessentials' },
  { name: 'FitGear', slug: 'fitgear' },
  { name: 'BookHaven', slug: 'bookhaven' },
  { name: 'GlamZone', slug: 'glamzone' },
  { name: 'SwiftTech', slug: 'swifttech' },
  { name: 'UrbanStyle', slug: 'urbanstyle' },
];

const PRODUCT_NAMES = {
  electronics: [
    'Wireless Bluetooth Headphones', 'Smart Watch Pro', 'Portable Bluetooth Speaker',
    '4K Ultra HD Webcam', 'Wireless Charging Pad', 'USB-C Hub Adapter',
    'Mechanical Gaming Keyboard', 'Wireless Mouse', 'LED Monitor 27 inch',
    'Power Bank 20000mAh', 'Smart Home Hub', 'Wireless Earbuds Pro',
    'Action Camera 4K', 'Drone with Camera', 'Smart LED Bulb Pack',
  ],
  mobiles: [
    'Smartphone X Pro 128GB', 'Budget Phone Max 64GB', 'Flagship Phone Ultra 256GB',
    'Tablet Pro 10.5 inch', 'Refurbished Phone Lite', 'Phone Case Premium',
    'Screen Protector Pack', 'Wireless Charger Fast', 'Car Phone Mount',
    'Phone Gimbal Stabilizer',
  ],
  laptops: [
    'UltraBook Pro 15.6" i7', 'Gaming Laptop RTX 4060', 'MacBook Air M3 Clone',
    'Business Laptop 14" i5', '2-in-1 Touchscreen Laptop', 'Chromebook 14 inch',
  ],
  fashion: [
    'Classic Cotton T-Shirt', 'Slim Fit Denim Jeans', 'Casual Sneakers',
    'Leather Wallet', 'Aviator Sunglasses', 'Formal Dress Shirt',
    'Running Shoes', 'Winter Jacket', 'Silk Tie Set',
    'Canvas Backpack', 'Digital Watch', 'Polo Shirt',
  ],
  home: [
    'Ceramic Dinner Set', 'Stainless Steel Cookware', 'Bed Sheet Set King',
    'Curtains Blackout', 'Wall Clock Modern', 'LED Table Lamp',
    'Vacuum Cleaner Robot', 'Air Purifier HEPA', 'Smart Rice Cooker',
    'Water Purifier RO',
  ],
  sports: [
    'Yoga Mat Premium', 'Resistance Bands Set', 'Dumbbells Set 20kg',
    'Cricket Bat English Willow', 'Football Professional', 'Tennis Racket',
    'Gym Gloves', 'Protein Shaker Bottle', 'Sports Shoes Running',
  ],
  books: [
    'The Art of Programming', 'Business Strategy Guide', 'Self-Help Bestseller',
    'Science Fiction Collection', 'Cooking Masterclass Book', 'Children Story Book Set',
  ],
  beauty: [
    'Face Moisturizer SPF 50', 'Hair Serum Argan Oil', 'Perfume Luxury Edition',
    'Makeup Kit Professional', 'Face Wash Gel', 'Body Lotion Natural',
    'Lipstick Matte Set', 'Eye Shadow Palette',
  ],
};

function getRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomPrice(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
  console.log('🌱 Seeding database...');

  // Clean up existing data (order matters for foreign keys)
  await db.flashSaleItem.deleteMany();
  await db.flashSale.deleteMany();
  await db.deal.deleteMany();
  await db.ticketMessage.deleteMany();
  await db.supportTicket.deleteMany();
  await db.fAQ.deleteMany();
  await db.searchAnalytics.deleteMany();
  await db.searchHistory.deleteMany();
  await db.recentlyViewed.deleteMany();
  await db.walletTransaction.deleteMany();
  await db.payout.deleteMany();
  await db.vendorWallet.deleteMany();
  await db.productQA.deleteMany();
  await db.inventoryHistory.deleteMany();
  await db.orderItem.deleteMany();
  await db.returnRequest.deleteMany();
  await db.order.deleteMany();
  await db.cartItem.deleteMany();
  await db.wishlistItem.deleteMany();
  await db.review.deleteMany();
  await db.productSpec.deleteMany();
  await db.productVariant.deleteMany();
  await db.productImage.deleteMany();
  await db.product.deleteMany();
  await db.settlement.deleteMany();
  await db.vendor.deleteMany();
  await db.notification.deleteMany();
  await db.activityLog.deleteMany();
  await db.customerAddress.deleteMany();
  await db.customerProfile.deleteMany();
  await db.coupon.deleteMany();
  await db.banner.deleteMany();
  await db.platformSettings.deleteMany();
  await db.brand.deleteMany();
  await db.category.deleteMany();
  await db.user.deleteMany();

  // 1. Create categories
  const categoryMap: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const created = await db.category.create({ data: cat });
    categoryMap[cat.slug] = created.id;
  }
  // Set parent relationships
  await db.category.update({ where: { slug: 'mobiles' }, data: { parentId: categoryMap['electronics'] } });
  await db.category.update({ where: { slug: 'laptops' }, data: { parentId: categoryMap['electronics'] } });
  await db.category.update({ where: { slug: 'accessories' }, data: { parentId: categoryMap['electronics'] } });
  await db.category.update({ where: { slug: 'men' }, data: { parentId: categoryMap['fashion'] } });
  await db.category.update({ where: { slug: 'women' }, data: { parentId: categoryMap['fashion'] } });
  await db.category.update({ where: { slug: 'kids' }, data: { parentId: categoryMap['fashion'] } });
  await db.category.update({ where: { slug: 'furniture' }, data: { parentId: categoryMap['home-kitchen'] } });
  await db.category.update({ where: { slug: 'appliances' }, data: { parentId: categoryMap['home-kitchen'] } });

  // 2. Create brands
  const brandMap: Record<string, string> = {};
  for (const brand of BRANDS) {
    const created = await db.brand.create({ data: brand });
    brandMap[brand.slug] = created.id;
  }

  // 3. Create admin user
  const adminPassword = await hash('admin123', 12);
  const admin = await db.user.create({
    data: {
      email: 'admin@markethub.com',
      password: adminPassword,
      name: 'Super Admin',
      role: 'ADMIN',
      isVerified: true,
    },
  });

  // 4. Create vendor users and profiles
  const vendorData = [
    { email: 'techstore@vendor.com', name: 'TechStore India', businessName: 'TechStore India', commission: 12 },
    { email: 'fashionhub@vendor.com', name: 'FashionHub', businessName: 'FashionHub', commission: 15 },
    { email: 'homeplus@vendor.com', name: 'HomePlus', businessName: 'HomePlus', commission: 10 },
    { email: 'sportszone@vendor.com', name: 'SportsZone', businessName: 'SportsZone', commission: 12 },
    { email: 'bookworld@vendor.com', name: 'BookWorld', businessName: 'BookWorld', commission: 8 },
  ];
  const vendors: { id: string; userId: string; totalRevenue: number }[] = [];
  for (const vd of vendorData) {
    const vp = await hash('vendor123', 12);
    const user = await db.user.create({
      data: { email: vd.email, password: vp, name: vd.name, role: 'VENDOR', isVerified: true },
    });
    const vendorTotalSales = randomPrice(50000, 500000);
    const vendorTotalRevenue = randomPrice(40000, 400000);
    const vendor = await db.vendor.create({
      data: {
        userId: user.id,
        businessName: vd.businessName,
        slug: vd.businessName.toLowerCase().replace(/\s+/g, '-'),
        description: `Premium ${vd.businessName} products at best prices`,
        businessEmail: vd.email,
        commissionRate: vd.commission,
        status: 'APPROVED',
        totalSales: vendorTotalSales,
        totalRevenue: vendorTotalRevenue,
        rating: randomPrice(3.5, 5.0),
      },
    });
    vendors.push({ id: vendor.id, userId: user.id, totalRevenue: vendorTotalRevenue });
  }

  // 5. Create customer users
  const customerNames = [
    { name: 'Rahul Sharma', email: 'rahul@example.com' },
    { name: 'Priya Patel', email: 'priya@example.com' },
    { name: 'Amit Kumar', email: 'amit@example.com' },
    { name: 'Sneha Reddy', email: 'sneha@example.com' },
    { name: 'Vikram Singh', email: 'vikram@example.com' },
    { name: 'Ananya Gupta', email: 'ananya@example.com' },
    { name: 'Karthik Nair', email: 'karthik@example.com' },
    { name: 'Deepa Iyer', email: 'deepa@example.com' },
  ];
  const customerPasswords = await hash('customer123', 12);
  const customers: string[] = [];
  for (const cd of customerNames) {
    const user = await db.user.create({
      data: { email: cd.email, password: customerPasswords, name: cd.name, role: 'CUSTOMER', isVerified: true },
    });
    await db.customerProfile.create({ data: { userId: user.id, gender: Math.random() > 0.5 ? 'Male' : 'Female', loyaltyPoints: randomInt(100, 5000) } });
    await db.customerAddress.create({
      data: {
        userId: user.id, label: 'Home', fullName: cd.name, phone: `+91${randomInt(7000000000, 9999999999)}`,
        addressLine1: `${randomInt(1, 500)}, Sector ${randomInt(1, 50)}`,
        city: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata'][randomInt(0, 6)],
        state: ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Maharashtra', 'West Bengal'][randomInt(0, 6)],
        pincode: `${randomInt(100000, 999999)}`, isDefault: true,
      },
    });
    customers.push(user.id);
  }

  // 6. Create products
  const productEntries: { catSlug: string; names: string[]; brandSlugs: string[]; vendorIdx: number[] }[] = [
    { catSlug: 'electronics', names: PRODUCT_NAMES.electronics, brandSlugs: ['techpro', 'swifttech'], vendorIdx: [0] },
    { catSlug: 'mobiles', names: PRODUCT_NAMES.mobiles, brandSlugs: ['techpro', 'swifttech'], vendorIdx: [0] },
    { catSlug: 'laptops', names: PRODUCT_NAMES.laptops, brandSlugs: ['techpro', 'swifttech'], vendorIdx: [0] },
    { catSlug: 'fashion', names: PRODUCT_NAMES.fashion, brandSlugs: ['stylewear', 'urbanstyle'], vendorIdx: [1] },
    { catSlug: 'men', names: ['Formal Suit Premium', 'Casual Shirt Collection', 'Leather Belt Genuine'], brandSlugs: ['stylewear', 'urbanstyle'], vendorIdx: [1] },
    { catSlug: 'women', names: ['Designer Saree Silk', 'Handbag Leather', 'Ethnic Kurta Set'], brandSlugs: ['stylewear', 'urbanstyle'], vendorIdx: [1] },
    { catSlug: 'home-kitchen', names: PRODUCT_NAMES.home, brandSlugs: ['homeessentials'], vendorIdx: [2] },
    { catSlug: 'furniture', names: ['Office Chair Ergonomic', 'Study Table Wooden', 'Sofa Set 3+2+1'], brandSlugs: ['homeessentials'], vendorIdx: [2] },
    { catSlug: 'sports', names: PRODUCT_NAMES.sports, brandSlugs: ['fitgear'], vendorIdx: [3] },
    { catSlug: 'books', names: PRODUCT_NAMES.books, brandSlugs: ['bookhaven'], vendorIdx: [4] },
    { catSlug: 'beauty', names: PRODUCT_NAMES.beauty, brandSlugs: ['glamzone'], vendorIdx: [1] },
  ];

  const allProducts: string[] = [];
  const badges: (string | null)[] = ['BEST_SELLER', 'NEW_ARRIVAL', 'LIMITED_TIME', 'FESTIVAL_OFFER', null, null, null];
  for (const entry of productEntries) {
    for (const name of entry.names) {
      const vi = entry.vendorIdx[randomInt(0, entry.vendorIdx.length - 1)];
      const vendor = vendors[vi];
      const brandSlug = entry.brandSlugs[randomInt(0, entry.brandSlugs.length - 1)];
      const price = randomPrice(199, 49999);
      const comparePrice = price * randomPrice(1.1, 1.5);
      const stock = randomInt(5, 200);
      const badge = badges[randomInt(0, badges.length - 1)];

      const product = await db.product.create({
        data: {
          vendorId: vendor.id,
          categoryId: categoryMap[entry.catSlug]!,
          brandId: brandMap[brandSlug],
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          description: `High quality ${name.toLowerCase()}. Perfect for everyday use with premium materials and craftsmanship.`,
          shortDescription: `Buy ${name} at best price`,
          price,
          compareAtPrice: Math.round(comparePrice * 100) / 100,
          costPrice: Math.round(price * 0.6 * 100) / 100,
          stock,
          weight: randomPrice(0.1, 10),
          isFeatured: Math.random() > 0.7,
          badge,
          estimatedDeliveryDays: randomInt(3, 10),
          rating: randomPrice(3.0, 5.0),
          reviewCount: randomInt(1, 150),
          totalSold: randomInt(10, 500),
          seoTitle: name,
          seoDescription: `Shop ${name} online at best price`,
        },
      });

      // Add images
      const colors = ['red', 'blue', 'black', 'white', 'green', 'gray'];
      for (let i = 0; i < randomInt(2, 4); i++) {
        await db.productImage.create({
          data: {
            productId: product.id,
            url: `https://placehold.co/600x600/${colors[i % colors.length]}/ffffff?text=${encodeURIComponent(name.substring(0, 15))}`,
            alt: `${name} - Image ${i + 1}`,
            sortOrder: i,
          },
        });
      }

      // Add variants
      if (Math.random() > 0.3) {
        const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
        const colors2 = ['Black', 'White', 'Red', 'Blue', 'Green'];
        for (const size of getRandomItems(sizes, randomInt(2, 4))) {
          await db.productVariant.create({
            data: { productId: product.id, name: 'Size', value: size, stock: randomInt(2, 50) },
          });
        }
        for (const color of getRandomItems(colors2, randomInt(1, 3))) {
          await db.productVariant.create({
            data: { productId: product.id, name: 'Color', value: color, stock: randomInt(2, 50) },
          });
        }
      }

      // Add specs
      const specKeys = ['Material', 'Weight', 'Dimensions', 'Warranty', 'Color', 'Brand', 'Model'];
      for (const key of getRandomItems(specKeys, randomInt(2, 4))) {
        await db.productSpec.create({
          data: { productId: product.id, key, value: `${key} - ${name.substring(0, 10)}` },
        });
      }

      allProducts.push(product.id);
    }
  }

  // 7. Create some orders
  const statuses = ['NEW', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  const paymentMethods = ['COD', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking'];
  for (let i = 0; i < 20; i++) {
    const customerId = customers[randomInt(0, customers.length - 1)];
    const numItems = randomInt(1, 3);
    const selectedProducts = getRandomItems(allProducts, numItems);
    let subtotal = 0;

    const orderItemsData = [];
    for (const pid of selectedProducts) {
      const prod = await db.product.findUnique({ where: { id: pid }, include: { vendor: true } });
      if (prod) {
        const qty = randomInt(1, 3);
        const itemTotal = prod.price * qty;
        subtotal += itemTotal;
        orderItemsData.push({
          productId: pid,
          vendorId: prod.vendorId,
          productName: prod.name,
          productImage: `https://placehold.co/100x100/333/fff?text=${encodeURIComponent(prod.name.substring(0, 10))}`,
          quantity: qty,
          price: prod.price,
          total: itemTotal,
          status: statuses[randomInt(0, statuses.length - 1)],
          vendorName: prod.vendor.businessName,
        });
      }
    }

    if (orderItemsData.length > 0) {
      const shipping = subtotal > 500 ? 0 : 99;
      const tax = subtotal * 0.18;
      const orderStatus = statuses[randomInt(0, statuses.length - 1)];
      const isCancelled = orderStatus === 'CANCELLED';

      const order = await db.order.create({
        data: {
          userId: customerId,
          orderNumber: `ORD-${String(1000 + i).padStart(6, '0')}`,
          subtotal: Math.round(subtotal * 100) / 100,
          shippingCost: shipping,
          tax: Math.round(tax * 100) / 100,
          total: Math.round((subtotal + shipping + tax) * 100) / 100,
          status: orderStatus,
          paymentMethod: paymentMethods[randomInt(0, paymentMethods.length - 1)],
          paymentStatus: Math.random() > 0.2 ? 'PAID' : 'PENDING',
          shippingAddress: '123, Main Street, Mumbai, Maharashtra 400001',
          ...(isCancelled ? {
            cancellationReason: 'Customer requested cancellation',
            cancelledAt: new Date(Date.now() - randomInt(1, 5) * 24 * 60 * 60 * 1000),
          } : {}),
          items: { create: orderItemsData },
        },
      });
    }
  }

  // Also create a guest order (userId is null)
  {
    const selectedProducts = getRandomItems(allProducts, 2);
    let subtotal = 0;
    const orderItemsData = [];
    for (const pid of selectedProducts) {
      const prod = await db.product.findUnique({ where: { id: pid }, include: { vendor: true } });
      if (prod) {
        const qty = randomInt(1, 2);
        const itemTotal = prod.price * qty;
        subtotal += itemTotal;
        orderItemsData.push({
          productId: pid,
          vendorId: prod.vendorId,
          productName: prod.name,
          productImage: `https://placehold.co/100x100/333/fff?text=${encodeURIComponent(prod.name.substring(0, 10))}`,
          quantity: qty,
          price: prod.price,
          total: itemTotal,
          vendorName: prod.vendor.businessName,
        });
      }
    }
    if (orderItemsData.length > 0) {
      const shipping = subtotal > 500 ? 0 : 99;
      const tax = subtotal * 0.18;
      await db.order.create({
        data: {
          orderNumber: 'ORD-GUEST-00001',
          subtotal: Math.round(subtotal * 100) / 100,
          shippingCost: shipping,
          tax: Math.round(tax * 100) / 100,
          total: Math.round((subtotal + shipping + tax) * 100) / 100,
          status: 'DELIVERED',
          paymentMethod: 'COD',
          paymentStatus: 'PAID',
          shippingAddress: '456, Park Avenue, Delhi, Delhi 110001',
          guestEmail: 'guest@example.com',
          guestPhone: '+919876543210',
          items: { create: orderItemsData },
        },
      });
    }
  }

  // 8. Create reviews (with new fields: images, verifiedPurchase, helpfulCount)
  for (let i = 0; i < 40; i++) {
    const productId = allProducts[randomInt(0, allProducts.length - 1)];
    const userId = customers[randomInt(0, customers.length - 1)];
    const reviewImages = Math.random() > 0.7 ? 'https://placehold.co/400x400/eee/333?text=Review+Photo' : null;
    await db.review.create({
      data: {
        userId,
        productId,
        rating: randomInt(3, 5),
        title: ['Great product!', 'Good quality', 'Worth the price', 'Excellent!', 'Very satisfied'][randomInt(0, 4)],
        comment: `I bought this product and I am ${['very happy', 'satisfied', 'impressed', 'pleased'][randomInt(0, 3)]} with the quality. Would recommend to others.`,
        images: reviewImages,
        verifiedPurchase: Math.random() > 0.3,
        helpfulCount: randomInt(0, 25),
      },
    });
  }

  // 9. Create coupons (Platform + Vendor)
  await db.coupon.createMany({
    data: [
      // Platform coupons
      { code: 'WELCOME10', scope: 'PLATFORM', discountType: 'PERCENTAGE', discountValue: 10, minOrder: 500, maxDiscount: 200, usageLimit: 1000, usedCount: 150, startDate: new Date('2024-01-01'), endDate: new Date('2025-12-31'), isActive: true, autoSuggest: true, applicableType: 'ALL' },
      { code: 'FLAT500', scope: 'PLATFORM', discountType: 'FIXED', discountValue: 500, minOrder: 2000, usageLimit: 500, usedCount: 45, startDate: new Date('2024-01-01'), endDate: new Date('2025-12-31'), isActive: true, autoSuggest: false, applicableType: 'ALL' },
      { code: 'SAVE20', scope: 'PLATFORM', discountType: 'PERCENTAGE', discountValue: 20, minOrder: 1000, maxDiscount: 1000, usageLimit: 200, usedCount: 80, startDate: new Date('2024-06-01'), endDate: new Date('2025-06-30'), isActive: true, autoSuggest: true, applicableType: 'ALL' },
      // Vendor coupons (TechStore India - vendors[0])
      { code: 'TECH15', scope: 'VENDOR', vendorId: vendors[0].id, discountType: 'PERCENTAGE', discountValue: 15, minOrder: 300, maxDiscount: 500, usageLimit: 500, usedCount: 89, startDate: new Date('2024-01-01'), endDate: new Date('2025-12-31'), isActive: true, autoSuggest: true, applicableType: 'ALL' },
      { code: 'TECHFLAT200', scope: 'VENDOR', vendorId: vendors[0].id, discountType: 'FIXED', discountValue: 200, minOrder: 1000, usageLimit: 300, usedCount: 34, startDate: new Date('2024-03-01'), endDate: new Date('2025-12-31'), isActive: true, autoSuggest: true, applicableType: 'ALL' },
      // Vendor coupons (FashionHub - vendors[1])
      { code: 'FASHION25', scope: 'VENDOR', vendorId: vendors[1].id, discountType: 'PERCENTAGE', discountValue: 25, minOrder: 200, maxDiscount: 400, usageLimit: 400, usedCount: 120, startDate: new Date('2024-01-01'), endDate: new Date('2025-12-31'), isActive: true, autoSuggest: true, applicableType: 'ALL' },
      { code: 'STYLE300', scope: 'VENDOR', vendorId: vendors[1].id, discountType: 'FIXED', discountValue: 300, minOrder: 800, usageLimit: 200, usedCount: 56, startDate: new Date('2024-06-01'), endDate: new Date('2025-12-31'), isActive: true, autoSuggest: false, applicableType: 'ALL' },
      // Vendor coupons (HomePlus - vendors[2])
      { code: 'HOME10', scope: 'VENDOR', vendorId: vendors[2].id, discountType: 'PERCENTAGE', discountValue: 10, minOrder: 400, usageLimit: 300, usedCount: 67, startDate: new Date('2024-01-01'), endDate: new Date('2025-12-31'), isActive: true, autoSuggest: true, applicableType: 'ALL' },
      // Vendor coupons (SportsZone - vendors[3])
      { code: 'SPORTS20', scope: 'VENDOR', vendorId: vendors[3].id, discountType: 'PERCENTAGE', discountValue: 20, minOrder: 250, maxDiscount: 600, usageLimit: 250, usedCount: 43, startDate: new Date('2024-01-01'), endDate: new Date('2025-12-31'), isActive: true, autoSuggest: true, applicableType: 'ALL' },
    ],
  });

  // 10. Create banners
  await db.banner.createMany({
    data: [
      { title: 'Mega Electronics Sale', image: 'https://placehold.co/1200x400/ff6b35/ffffff?text=Mega+Electronics+Sale+-+Up+to+70%25+Off', position: 'HOME', sortOrder: 1, isActive: true, link: '#electronics' },
      { title: 'Fashion Fiesta', image: 'https://placehold.co/1200x400/e63946/ffffff?text=Fashion+Fiesta+-+New+Collection', position: 'HOME', sortOrder: 2, isActive: true, link: '#fashion' },
      { title: 'Home Essentials', image: 'https://placehold.co/1200x400/2a9d8f/ffffff?text=Home+Essentials+-+Best+Deals', position: 'HOME', sortOrder: 3, isActive: true, link: '#home-kitchen' },
      { title: 'Sports & Fitness', image: 'https://placehold.co/1200x400/e76f51/ffffff?text=Sports+%26+Fitness+Sale', position: 'HOME', sortOrder: 4, isActive: true, link: '#sports' },
    ],
  });

  // 11. Platform settings
  await db.platformSettings.create({
    data: {
      siteName: 'MarketHub',
      siteDescription: 'Your one-stop multi-vendor marketplace',
      currency: 'INR',
      currencySymbol: '₹',
      taxRate: 18.0,
      freeShippingMin: 500,
      contactEmail: 'support@markethub.com',
      contactPhone: '+91-1800-123-4567',
      address: 'MarketHub HQ, Bangalore, India',
    },
  });

  // 12. Create activity logs (with new fields: entityType, entityId, oldValues, newValues, userAgent)
  await db.activityLog.createMany({
    data: [
      { userId: admin.id, action: 'LOGIN', entityType: 'User', entityId: admin.id, details: 'Admin logged in', ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      { userId: vendors[0].userId, action: 'PRODUCT_CREATE', entityType: 'Product', entityId: allProducts[0], details: 'Created new product', ipAddress: '10.0.0.1', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)' },
      { userId: customers[0], action: 'ORDER_PLACE', entityType: 'Order', entityId: null, details: 'Placed order #ORD-001000', ipAddress: '172.16.0.1', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS)' },
      { userId: admin.id, action: 'UPDATE', entityType: 'Vendor', entityId: vendors[0].id, details: 'Updated vendor commission rate', oldValues: '{"commissionRate":10}', newValues: '{"commissionRate":12}', ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      { userId: vendors[1].userId, action: 'PRODUCT_UPDATE', entityType: 'Product', entityId: allProducts[15], details: 'Updated product price', oldValues: '{"price":999}', newValues: '{"price":899}', ipAddress: '10.0.0.2', userAgent: 'Mozilla/5.0 (X11; Linux x86_64)' },
    ],
  });

  // =============================================
  // NEW MODEL SEED DATA
  // =============================================

  // 13. Create VendorWallet for all APPROVED vendors
  for (const vendor of vendors) {
    const availableBalance = randomPrice(5000, vendor.totalRevenue * 0.6);
    const totalWithdrawn = randomPrice(1000, vendor.totalRevenue * 0.3);
    const pendingBalance = vendor.totalRevenue - availableBalance - totalWithdrawn;
    await db.vendorWallet.create({
      data: {
        vendorId: vendor.id,
        availableBalance: Math.round(availableBalance * 100) / 100,
        pendingBalance: Math.round(Math.max(0, pendingBalance) * 100) / 100,
        totalEarned: Math.round(vendor.totalRevenue * 100) / 100,
        totalWithdrawn: Math.round(totalWithdrawn * 100) / 100,
      },
    });
  }

  // 14. Create FAQs
  await db.fAQ.createMany({
    data: [
      { question: 'How do I place an order?', answer: 'Browse products, add items to your cart, proceed to checkout, select a payment method, and confirm your order. You will receive an order confirmation email with tracking details.', category: 'GENERAL', sortOrder: 1, isActive: true },
      { question: 'What payment methods are accepted?', answer: 'We accept Credit Cards, Debit Cards, UPI, Net Banking, and Cash on Delivery (COD). All online payments are secured with 256-bit encryption.', category: 'PAYMENT', sortOrder: 2, isActive: true },
      { question: 'How long does delivery take?', answer: 'Standard delivery takes 3-7 business days depending on your location. Express delivery (available in select cities) takes 1-2 business days. You can track your order from the Orders section.', category: 'ORDER', sortOrder: 3, isActive: true },
      { question: 'What is the return and refund policy?', answer: 'You can return most items within 7 days of delivery. Items must be unused and in original packaging. Refunds are processed within 5-7 business days after we receive the returned item.', category: 'REFUND', sortOrder: 4, isActive: true },
      { question: 'How do I become a vendor on MarketHub?', answer: 'Click "Become a Seller" on our homepage, fill in your business details, upload required documents (GST, PAN, bank details), and submit for approval. Once approved, you can start listing products within 24 hours.', category: 'GENERAL', sortOrder: 5, isActive: true },
    ],
  });

  // 15. Create FlashSales with items
  const flashSale1 = await db.flashSale.create({
    data: {
      title: 'Lightning Deal - Electronics',
      description: 'Grab electronics at unbeatable prices! Limited time offer.',
      banner: 'https://placehold.co/1200x300/f59e0b/ffffff?text=Lightning+Deal+-+Electronics',
      startDate: new Date('2025-01-01T00:00:00.000Z'),
      endDate: new Date('2025-12-31T23:59:59.000Z'),
      isActive: true,
    },
  });

  // Get some electronics products for flash sale
  const electronicsProducts = await db.product.findMany({
    where: { categoryId: categoryMap['electronics'] },
    take: 4,
  });

  for (let i = 0; i < electronicsProducts.length; i++) {
    const prod = electronicsProducts[i];
    const discount = randomInt(15, 40);
    await db.flashSaleItem.create({
      data: {
        flashSaleId: flashSale1.id,
        productId: prod.id,
        salePrice: Math.round(prod.price * (1 - discount / 100) * 100) / 100,
        originalPrice: prod.price,
        discountPercent: discount,
        totalStock: randomInt(20, 100),
        soldCount: randomInt(5, 50),
        sortOrder: i,
      },
    });
  }

  const flashSale2 = await db.flashSale.create({
    data: {
      title: 'Flash Sale - Fashion Week',
      description: 'Style up with amazing fashion deals this week!',
      banner: 'https://placehold.co/1200x300/e63946/ffffff?text=Flash+Sale+-+Fashion+Week',
      startDate: new Date('2025-01-01T00:00:00.000Z'),
      endDate: new Date('2025-12-31T23:59:59.000Z'),
      isActive: true,
    },
  });

  const fashionProducts = await db.product.findMany({
    where: { categoryId: categoryMap['fashion'] },
    take: 3,
  });

  for (let i = 0; i < fashionProducts.length; i++) {
    const prod = fashionProducts[i];
    const discount = randomInt(20, 50);
    await db.flashSaleItem.create({
      data: {
        flashSaleId: flashSale2.id,
        productId: prod.id,
        salePrice: Math.round(prod.price * (1 - discount / 100) * 100) / 100,
        originalPrice: prod.price,
        discountPercent: discount,
        totalStock: randomInt(30, 150),
        soldCount: randomInt(10, 80),
        sortOrder: i,
      },
    });
  }

  // 16. Create Deals
  const dealProducts = await db.product.findMany({
    where: { isFeatured: true },
    take: 3,
  });

  for (let i = 0; i < dealProducts.length; i++) {
    const prod = dealProducts[i];
    const discount = randomInt(10, 35);
    await db.deal.create({
      data: {
        title: `Deal of the Day - ${prod.name}`,
        description: `Don't miss out on ${prod.name} at ${discount}% off! Limited time only.`,
        productId: prod.id,
        discountPercent: discount,
        startDate: new Date('2025-01-01T00:00:00.000Z'),
        endDate: new Date('2025-12-31T23:59:59.000Z'),
        isActive: true,
        sortOrder: i + 1,
      },
    });
  }

  // 17. Create SearchAnalytics
  await db.searchAnalytics.createMany({
    data: [
      { query: 'wireless headphones', searchCount: 1250, resultCount: 8, noResults: false, lastSearched: new Date('2025-01-15T10:30:00.000Z') },
      { query: 'iphone 15', searchCount: 980, resultCount: 3, noResults: false, lastSearched: new Date('2025-01-15T09:15:00.000Z') },
      { query: 'laptop under 50000', searchCount: 756, resultCount: 12, noResults: false, lastSearched: new Date('2025-01-14T18:45:00.000Z') },
      { query: 'running shoes', searchCount: 634, resultCount: 15, noResults: false, lastSearched: new Date('2025-01-15T11:00:00.000Z') },
      { query: 'saree', searchCount: 521, resultCount: 9, noResults: false, lastSearched: new Date('2025-01-13T14:20:00.000Z') },
      { query: 'yoga mat', searchCount: 412, resultCount: 6, noResults: false, lastSearched: new Date('2025-01-15T07:30:00.000Z') },
      { query: 'smart watch', searchCount: 389, resultCount: 7, noResults: false, lastSearched: new Date('2025-01-14T16:00:00.000Z') },
      { query: 'nonexistent product xyz', searchCount: 45, resultCount: 0, noResults: true, lastSearched: new Date('2025-01-12T22:10:00.000Z') },
    ],
  });

  // 18. Create SearchHistory for a few users
  await db.searchHistory.createMany({
    data: [
      { userId: customers[0], query: 'wireless headphones', results: 8 },
      { userId: customers[0], query: 'laptop under 50000', results: 12 },
      { userId: customers[1], query: 'running shoes', results: 15 },
      { userId: customers[2], query: 'saree', results: 9 },
      { sessionId: 'guest-session-abc123', query: 'smart watch', results: 7 },
    ],
  });

  // 19. Create RecentlyViewed for some users
  const recentlyViewedData = [];
  for (let i = 0; i < 3; i++) {
    const userId = customers[i];
    const productIds = getRandomItems(allProducts, randomInt(3, 6));
    for (const pid of productIds) {
      recentlyViewedData.push({ userId, productId: pid });
    }
  }
  await db.recentlyViewed.createMany({ data: recentlyViewedData });

  // 20. Create SupportTickets with messages
  const supportTicket1 = await db.supportTicket.create({
    data: {
      userId: customers[0],
      subject: 'Order not received after expected delivery date',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      category: 'ORDER',
      assignedTo: admin.id,
    },
  });
  await db.ticketMessage.createMany({
    data: [
      { ticketId: supportTicket1.id, userId: customers[0], message: 'I placed order #ORD-001003 on Jan 5th and the estimated delivery was Jan 10th, but I still haven\'t received it. Can you please check?', isStaff: false },
      { ticketId: supportTicket1.id, userId: admin.id, message: 'I\'m sorry for the delay. I\'ve checked with the courier and there was a transit delay. Your order is expected to be delivered by Jan 13th. I\'ll keep you updated.', isStaff: true },
    ],
  });

  const supportTicket2 = await db.supportTicket.create({
    data: {
      userId: customers[3],
      subject: 'Wrong product delivered',
      status: 'OPEN',
      priority: 'URGENT',
      category: 'PRODUCT',
    },
  });
  await db.ticketMessage.createMany({
    data: [
      { ticketId: supportTicket2.id, userId: customers[3], message: 'I ordered a Wireless Bluetooth Headphone (Black) but received a wired earphone instead. This is completely wrong. I need a replacement ASAP.', isStaff: false },
    ],
  });

  const supportTicket3 = await db.supportTicket.create({
    data: {
      userId: customers[5],
      subject: 'Refund not processed for returned item',
      status: 'RESOLVED',
      priority: 'MEDIUM',
      category: 'REFUND',
      assignedTo: admin.id,
    },
  });
  await db.ticketMessage.createMany({
    data: [
      { ticketId: supportTicket3.id, userId: customers[5], message: 'I returned a product on Dec 28th and the tracking shows it was delivered to your warehouse on Jan 2nd. But I still haven\'t received my refund of ₹1,299.', isStaff: false },
      { ticketId: supportTicket3.id, userId: admin.id, message: 'Thank you for your patience. The refund has been processed to your original payment method. It should reflect in 3-5 business days. Reference: REF-2025-0089.', isStaff: true },
      { ticketId: supportTicket3.id, userId: customers[5], message: 'Thank you! I received the refund today. Closing this ticket.', isStaff: false },
    ],
  });

  const supportTicket4 = await db.supportTicket.create({
    data: {
      subject: 'Payment failed but amount deducted',
      status: 'OPEN',
      priority: 'HIGH',
      category: 'PAYMENT',
    },
  });
  await db.ticketMessage.createMany({
    data: [
      { ticketId: supportTicket4.id, message: 'I tried to place an order as a guest and the payment page showed "Transaction Failed" but ₹2,499 was deducted from my bank account. Order was not placed. Please help.', isStaff: false },
    ],
  });

  // 21. Create ProductQA for some products
  const qaProducts = getRandomItems(allProducts, 5);
  for (const pid of qaProducts) {
    const prod = await db.product.findUnique({ where: { id: pid } });
    if (prod) {
      await db.productQA.create({
        data: {
          productId: pid,
          userId: customers[randomInt(0, customers.length - 1)],
          question: `Is this ${prod.name.substring(0, 20)} available in different colors?`,
          answer: 'Yes, this product is available in multiple color options. Please check the variants section on the product page.',
          answeredBy: vendors[0].userId,
          answeredAt: new Date(Date.now() - randomInt(1, 10) * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  // 22. Create InventoryHistory for some products
  const invProducts = getRandomItems(allProducts, 8);
  for (const pid of invProducts) {
    await db.inventoryHistory.createMany({
      data: [
        { productId: pid, type: 'ADDED', quantity: randomInt(20, 100), note: 'Initial stock' },
        { productId: pid, type: 'SOLD', quantity: randomInt(1, 15), note: 'Customer order' },
        { productId: pid, type: 'ADDED', quantity: randomInt(5, 30), note: 'Restocked by vendor' },
      ],
    });
  }

  // 23. Create Notifications for users
  await db.notification.createMany({
    data: [
      { userId: customers[0], title: 'Order Shipped', message: 'Your order #ORD-001003 has been shipped! Track your delivery.', type: 'ORDER', link: '/orders', isRead: false },
      { userId: customers[1], title: 'Price Drop Alert', message: 'A product in your wishlist has dropped in price by 20%!', type: 'PROMOTION', link: '/wishlist', isRead: false },
      { userId: vendors[0].userId, title: 'New Order Received', message: 'You have received a new order. Please process it within 24 hours.', type: 'ORDER', isRead: true },
      { userId: customers[2], title: 'Welcome to MarketHub!', message: 'Thank you for signing up. Use code WELCOME10 for 10% off your first order.', type: 'INFO', isRead: true },
      { userId: null, title: 'Flash Sale Live Now!', message: 'Lightning deals on electronics are live. Grab them before they\'re gone!', type: 'PROMOTION', isRead: false },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log(`   Admin: admin@markethub.com / admin123`);
  console.log(`   Vendors: ${vendorData.map(v => `${v.email} / vendor123`).join(', ')}`);
  console.log(`   Customer: ${customerNames.map(c => `${c.email} / customer123`).join(', ')}`);
  console.log(`   Products: ${allProducts.length}`);
  console.log(`   Categories: ${CATEGORIES.length}`);
  console.log(`   Brands: ${BRANDS.length}`);
  console.log(`   FAQs: 5`);
  console.log(`   FlashSales: 2`);
  console.log(`   Deals: ${dealProducts.length}`);
  console.log(`   VendorWallets: ${vendors.length}`);
  console.log(`   SupportTickets: 4`);
  console.log(`   SearchAnalytics: 8`);
}

seed()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => { db.$disconnect(); process.exit(0); });