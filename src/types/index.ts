// ============ AUTH ============

export type UserRole = 'ADMIN' | 'VENDOR' | 'CUSTOMER';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string | null;
  phone?: string | null;
  isVerified: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  vendorId?: string;
}

// ============ PRODUCTS ============

export interface Product {
  id: string;
  vendorId: string;
  categoryId: string;
  brandId?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  sku?: string | null;
  barcode?: string | null;
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  stock: number;
  lowStockAlert: number;
  weight?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  warranty?: string | null;
  returnPolicy?: string | null;
  shippingCost: number;
  isFeatured: boolean;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  totalSold: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  createdAt: string;
  updatedAt: string;
  // Relations
  vendor?: Vendor;
  category?: Category;
  brand?: Brand | null;
  images?: ProductImage[];
  variants?: ProductVariant[];
  specs?: ProductSpec[];
  _count?: {
    reviews: number;
    orderItems: number;
  };
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt?: string | null;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  value: string;
  price?: number | null;
  stock: number;
  sku?: string | null;
}

export interface ProductSpec {
  id: string;
  productId: string;
  key: string;
  value: string;
}

// ============ CATEGORIES & BRANDS ============

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  parentId?: string | null;
  sortOrder: number;
  isActive: boolean;
  children?: Category[];
  _count?: { products: number };
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  description?: string | null;
  isActive: boolean;
  _count?: { products: number };
}

// ============ VENDORS ============

export interface Vendor {
  id: string;
  userId: string;
  businessName: string;
  slug: string;
  logo?: string | null;
  banner?: string | null;
  description?: string | null;
  businessEmail?: string | null;
  businessPhone?: string | null;
  businessAddress?: string | null;
  gstNumber?: string | null;
  panNumber?: string | null;
  bankName?: string | null;
  bankAccount?: string | null;
  bankIfsc?: string | null;
  commissionRate: number;
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';
  totalSales: number;
  totalRevenue: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
  user?: AuthUser;
  _count?: { products: number };
}

// ============ ORDERS ============

export type OrderStatus = 'NEW' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED' | 'REFUNDED';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  shippingAddress: string;
  billingAddress?: string | null;
  trackingId?: string | null;
  courierName?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  user?: AuthUser;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  vendorId: string;
  productName: string;
  productImage?: string | null;
  quantity: number;
  price: number;
  total: number;
  status: OrderStatus;
  vendorName?: string | null;
}

// ============ CART ============

export interface CartItemData {
  id?: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  vendorName?: string;
  vendorId?: string;
  stock?: number;
}

// ============ REVIEWS ============

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  isActive: boolean;
  createdAt: string;
  user?: AuthUser;
}

// ============ COUPONS ============

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrder?: number | null;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// ============ BANNERS ============

export interface Banner {
  id: string;
  title: string;
  image: string;
  link?: string | null;
  position: string;
  sortOrder: number;
  isActive: boolean;
}

// ============ NOTIFICATIONS ============

export interface Notification {
  id: string;
  userId?: string | null;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  isRead: boolean;
  createdAt: string;
}

// ============ SETTINGS ============

export interface PlatformSettings {
  id: string;
  siteName: string;
  siteDescription?: string | null;
  logo?: string | null;
  favicon?: string | null;
  currency: string;
  currencySymbol: string;
  taxRate: number;
  freeShippingMin: number;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  socialLinks?: string | null;
}

// ============ CUSTOMER ADDRESS ============

export interface CustomerAddress {
  id: string;
  userId: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  country: string;
  pincode: string;
  isDefault: boolean;
}

// ============ ACTIVITY LOG ============

export interface ActivityLog {
  id: string;
  userId?: string | null;
  action: string;
  details?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  user?: AuthUser;
}

// ============ API RESPONSE ============

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============ DASHBOARD STATS ============

export interface AdminDashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  totalVendors: number;
  platformEarnings: number;
  recentOrders: Order[];
  topProducts: Product[];
  monthlySales: { month: string; sales: number }[];
}

export interface VendorDashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  avgRating: number;
  recentOrders: Order[];
  topProducts: Product[];
  monthlySales: { month: string; sales: number }[];
}

// ============ UI NAVIGATION ============

export type CustomerView = 
  | 'home' | 'products' | 'product-detail' | 'cart' | 'checkout' 
  | 'orders' | 'order-detail' | 'profile' | 'addresses' | 'wishlist' 
  | 'compare' | 'login' | 'register' | 'search';

export type VendorView = 
  | 'vendor-login' | 'vendor-dashboard' | 'vendor-products' | 'vendor-add-product'
  | 'vendor-orders' | 'vendor-reports' | 'vendor-profile' | 'vendor-notifications'
  | 'vendor-settings';

export type AdminView = 
  | 'admin-login' | 'admin-dashboard' | 'admin-vendors' | 'admin-vendor-detail'
  | 'admin-categories' | 'admin-brands' | 'admin-products' | 'admin-orders'
  | 'admin-customers' | 'admin-coupons' | 'admin-banners' | 'admin-reports'
  | 'admin-settings' | 'admin-activity-logs' | 'admin-notifications';

export type AppView = 'customer' | 'vendor' | 'admin';