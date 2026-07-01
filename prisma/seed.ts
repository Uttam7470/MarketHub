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

  // Clean up existing data
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
  const vendors: { id: string; userId: string }[] = [];
  for (const vd of vendorData) {
    const vp = await hash('vendor123', 12);
    const user = await db.user.create({
      data: { email: vd.email, password: vp, name: vd.name, role: 'VENDOR', isVerified: true },
    });
    const vendor = await db.vendor.create({
      data: {
        userId: user.id,
        businessName: vd.businessName,
        slug: vd.businessName.toLowerCase().replace(/\s+/g, '-'),
        description: `Premium ${vd.businessName} products at best prices`,
        businessEmail: vd.email,
        commissionRate: vd.commission,
        status: 'APPROVED',
        totalSales: randomPrice(50000, 500000),
        totalRevenue: randomPrice(40000, 400000),
        rating: randomPrice(3.5, 5.0),
      },
    });
    vendors.push({ id: vendor.id, userId: user.id });
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
  for (const entry of productEntries) {
    for (const name of entry.names) {
      const vi = entry.vendorIdx[randomInt(0, entry.vendorIdx.length - 1)];
      const vendor = vendors[vi];
      const brandSlug = entry.brandSlugs[randomInt(0, entry.brandSlugs.length - 1)];
      const price = randomPrice(199, 49999);
      const comparePrice = price * randomPrice(1.1, 1.5);
      const stock = randomInt(5, 200);

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
      const order = await db.order.create({
        data: {
          userId: customerId,
          orderNumber: `ORD-${String(1000 + i).padStart(6, '0')}`,
          subtotal: Math.round(subtotal * 100) / 100,
          shippingCost: shipping,
          tax: Math.round(tax * 100) / 100,
          total: Math.round((subtotal + shipping + tax) * 100) / 100,
          status: statuses[randomInt(0, statuses.length - 1)],
          paymentMethod: paymentMethods[randomInt(0, paymentMethods.length - 1)],
          paymentStatus: Math.random() > 0.2 ? 'PAID' : 'PENDING',
          shippingAddress: '123, Main Street, Mumbai, Maharashtra 400001',
          items: { create: orderItemsData },
        },
      });
    }
  }

  // 8. Create reviews
  for (let i = 0; i < 40; i++) {
    const productId = allProducts[randomInt(0, allProducts.length - 1)];
    const userId = customers[randomInt(0, customers.length - 1)];
    const user = await db.user.findUnique({ where: { id: userId } });
    await db.review.create({
      data: {
        userId,
        productId,
        rating: randomInt(3, 5),
        title: ['Great product!', 'Good quality', 'Worth the price', 'Excellent!', 'Very satisfied'][randomInt(0, 4)],
        comment: `I bought this product and I am ${['very happy', 'satisfied', 'impressed', 'pleased'][randomInt(0, 3)]} with the quality. Would recommend to others.`,
      },
    });
  }

  // 9. Create coupons
  await db.coupon.createMany({
    data: [
      { code: 'WELCOME10', discountType: 'PERCENTAGE', discountValue: 10, minOrder: 500, maxDiscount: 200, usageLimit: 1000, usedCount: 150, startDate: new Date('2024-01-01'), endDate: new Date('2025-12-31'), isActive: true },
      { code: 'FLAT500', discountType: 'FIXED', discountValue: 500, minOrder: 2000, usageLimit: 500, usedCount: 45, startDate: new Date('2024-01-01'), endDate: new Date('2025-12-31'), isActive: true },
      { code: 'SAVE20', discountType: 'PERCENTAGE', discountValue: 20, minOrder: 1000, maxDiscount: 1000, usageLimit: 200, usedCount: 80, startDate: new Date('2024-06-01'), endDate: new Date('2025-06-30'), isActive: true },
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

  // 12. Create activity logs
  await db.activityLog.createMany({
    data: [
      { userId: admin.id, action: 'LOGIN', details: 'Admin logged in', ipAddress: '192.168.1.1' },
      { userId: vendors[0].userId, action: 'PRODUCT_CREATE', details: 'Created new product', ipAddress: '10.0.0.1' },
      { userId: customers[0], action: 'ORDER_PLACE', details: 'Placed order #ORD-001000', ipAddress: '172.16.0.1' },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log(`   Admin: admin@markethub.com / admin123`);
  console.log(`   Vendors: ${vendorData.map(v => `${v.email} / vendor123`).join(', ')}`);
  console.log(`   Customer: ${customerNames.map(c => `${c.email} / customer123`).join(', ')}`);
  console.log(`   Products: ${allProducts.length}`);
  console.log(`   Categories: ${CATEGORIES.length}`);
  console.log(`   Brands: ${BRANDS.length}`);
}

seed()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => { db.$disconnect(); process.exit(0); });