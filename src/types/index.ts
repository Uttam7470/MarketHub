// ============ AUTH ============

export type UserRole = 'SUPER_ADMIN' | 'FINANCE_ADMIN' | 'SUPPORT_ADMIN' | 'INVENTORY_ADMIN' | 'ADMIN' | 'VENDOR' | 'CUSTOMER';
export type AdminRole = 'SUPER_ADMIN' | 'FINANCE_ADMIN' | 'SUPPORT_ADMIN' | 'INVENTORY_ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  adminRole?: AdminRole | null;
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
  vendorStatus?: string | null;
}

// ============ PRODUCTS ============

export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type ProductBadge = 'BEST_SELLER' | 'NEW_ARRIVAL' | 'LIMITED_TIME' | 'FESTIVAL_OFFER';

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
  productStatus: ProductStatus;
  badge?: ProductBadge | null;
  estimatedDeliveryDays: number;
  rating: number;
  reviewCount: number;
  totalSold: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  // Relations
  vendor?: Vendor;
  category?: Category;
  brand?: Brand | null;
  images?: ProductImage[];
  variants?: ProductVariant[];
  specs?: ProductSpec[];
  questions?: ProductQA[];
  deal?: Deal;
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

export interface ProductQA {
  id: string;
  productId: string;
  userId: string;
  question: string;
  answer?: string | null;
  answeredBy?: string | null;
  answeredAt?: string | null;
  isActive: boolean;
  createdAt: string;
  user?: AuthUser;
}

export interface InventoryHistory {
  id: string;
  productId: string;
  type: 'ADDED' | 'REMOVED' | 'SOLD' | 'ADJUSTED';
  quantity: number;
  note?: string | null;
  createdAt: string;
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
  rejectionReason?: string | null;
  totalSales: number;
  totalRevenue: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
  user?: AuthUser;
  wallet?: VendorWallet;
  _count?: { products: number };
}

// ============ VENDOR WALLET ============

export interface VendorWallet {
  id: string;
  vendorId: string;
  availableBalance: number;
  pendingBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
}

export interface WalletTransaction {
  id: string;
  vendorId: string;
  type: 'EARNING' | 'WITHDRAWAL' | 'ADJUSTMENT' | 'COMMISSION_DEDUCTION';
  amount: number;
  balance: number;
  description?: string | null;
  orderId?: string | null;
  payoutId?: string | null;
  createdAt: string;
  vendor?: Vendor;
}

export interface Payout {
  id: string;
  vendorId: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  bankName?: string | null;
  bankAccount?: string | null;
  bankIfsc?: string | null;
  processedBy?: string | null;
  processedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  vendor?: Vendor;
}

// ============ ORDERS ============

export type OrderStatus = 'NEW' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED' | 'REFUNDED';

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
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
  cancellationReason?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  returns?: ReturnRequest[];
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
  cancelledAt?: string | null;
}

// ============ RETURNS ============

export interface ReturnRequest {
  id: string;
  orderId: string;
  orderItemId: string;
  userId?: string | null;
  productId?: string | null;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  refundAmount?: number | null;
  refundStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED';
  refundProcessedAt?: string | null;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
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
  savedForLater?: boolean;
}

// ============ REVIEWS ============

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  images?: string | null;
  verifiedPurchase: boolean;
  helpfulCount: number;
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
  autoSuggest: boolean;
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

// ============ MARKETING ============

export interface FlashSale {
  id: string;
  title: string;
  description?: string | null;
  banner?: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  items?: FlashSaleItem[];
}

export interface FlashSaleItem {
  id: string;
  flashSaleId: string;
  productId: string;
  salePrice: number;
  originalPrice: number;
  discountPercent: number;
  totalStock: number;
  soldCount: number;
  sortOrder: number;
}

export interface Deal {
  id: string;
  title: string;
  description?: string | null;
  productId: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  sortOrder: number;
  product?: Product;
}

// ============ NOTIFICATIONS ============

export interface Notification {
  id: string;
  userId?: string | null;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

// ============ SUPPORT ============

export interface SupportTicket {
  id: string;
  userId?: string | null;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: 'GENERAL' | 'ORDER' | 'PAYMENT' | 'PRODUCT' | 'REFUND' | 'OTHER';
  assignedTo?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: AuthUser;
  messages?: TicketMessage[];
  _count?: { messages: number };
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  userId?: string | null;
  message: string;
  isStaff: boolean;
  createdAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
}

// ============ SEARCH & ANALYTICS ============

export interface SearchHistory {
  id: string;
  userId?: string | null;
  sessionId?: string | null;
  query: string;
  results: number;
  createdAt: string;
}

export interface SearchAnalytics {
  id: string;
  query: string;
  searchCount: number;
  resultCount: number;
  noResults: boolean;
  lastSearched: string;
}

export interface RecentlyViewed {
  id: string;
  userId?: string | null;
  sessionId?: string | null;
  productId: string;
  createdAt: string;
  product?: Product;
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
  entityType?: string | null;
  entityId?: string | null;
  details?: string | null;
  oldValues?: string | null;
  newValues?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
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
  todayRevenue: number;
  todayOrders: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  totalVendors: number;
  activeVendors: number;
  platformEarnings: number;
  pendingReturns: number;
  lowStockProducts: number;
  recentOrders: Order[];
  topProducts: Product[];
  topCategories: { name: string; count: number; revenue: number }[];
  monthlySales: { month: string; sales: number }[];
}

export interface VendorDashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  avgRating: number;
  lowStockProducts: number;
  cancelledOrders: number;
  refundRate: number;
  recentOrders: Order[];
  topProducts: Product[];
  topCategories: { name: string; count: number; revenue: number }[];
  monthlySales: { month: string; sales: number }[];
  monthlyComparison: { month: string; thisMonth: number; lastMonth: number }[];
}

// ============ UI NAVIGATION ============

export type CustomerView = 
  | 'home' | 'products' | 'product-detail' | 'cart' | 'checkout' 
  | 'orders' | 'order-detail' | 'profile' | 'addresses' | 'wishlist' 
  | 'compare' | 'login' | 'register' | 'search' | 'notifications' 
  | 'support' | 'faq' | 'track-order' | 'returns' | 'contact' | 'help' | 'about'
  | 'shipping-policy' | 'return-policy' | 'privacy-policy' | 'terms-of-service';

export type VendorView = 
  | 'vendor-login' | 'vendor-dashboard' | 'vendor-products' | 'vendor-add-product'
  | 'vendor-orders' | 'vendor-reports' | 'vendor-profile' | 'vendor-notifications'
  | 'vendor-settings' | 'vendor-wallet' | 'vendor-inventory';

export type AdminView = 
  | 'admin-login' | 'admin-dashboard' | 'admin-vendors' | 'admin-vendor-detail'
  | 'admin-categories' | 'admin-brands' | 'admin-products' | 'admin-orders'
  | 'admin-customers' | 'admin-coupons' | 'admin-banners' | 'admin-reports'
  | 'admin-settings' | 'admin-activity-logs' | 'admin-notifications'
  | 'admin-returns' | 'admin-payouts' | 'admin-analytics' | 'admin-roles'
  | 'admin-support' | 'admin-marketing' | 'admin-faq';

export type AppView = 'customer' | 'vendor' | 'admin';