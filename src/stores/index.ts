import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, AppView, CustomerView, VendorView, AdminView } from '@/types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  vendorId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser, token: string, vendorId?: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      vendorId: null,
      isAuthenticated: false,
      isLoading: false,
      login: (user, token, vendorId) =>
        set({ user, token, vendorId: vendorId || null, isAuthenticated: true, isLoading: false }),
      logout: () =>
        set({ user: null, token: null, vendorId: null, isAuthenticated: false, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    { name: 'marketplace-auth' }
  )
);

// ============ UI / NAVIGATION STORE ============

interface NavigationState {
  appView: AppView;
  customerView: CustomerView;
  vendorView: VendorView;
  adminView: AdminView;
  selectedProductId: string | null;
  selectedOrderId: string | null;
  selectedVendorId: string | null;
  searchQuery: string;
  selectedCategory: string | null;
  selectedBrand: string | null;
  priceRange: [number, number];
  sortBy: string;
  isMobileMenuOpen: boolean;
  isCartOpen: boolean;

  setAppView: (view: AppView) => void;
  setCustomerView: (view: CustomerView) => void;
  setVendorView: (view: VendorView) => void;
  setAdminView: (view: AdminView) => void;
  setSelectedProductId: (id: string | null) => void;
  setSelectedOrderId: (id: string | null) => void;
  setSelectedVendorId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (id: string | null) => void;
  setSelectedBrand: (id: string | null) => void;
  setPriceRange: (range: [number, number]) => void;
  setSortBy: (sort: string) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setCartOpen: (open: boolean) => void;
  navigateTo: (view: CustomerView | VendorView | AdminView, data?: Record<string, string | null>) => void;
}

export const useNavigationStore = create<NavigationState>()((set) => ({
  appView: 'customer',
  customerView: 'home',
  vendorView: 'vendor-dashboard',
  adminView: 'admin-dashboard',
  selectedProductId: null,
  selectedOrderId: null,
  selectedVendorId: null,
  searchQuery: '',
  selectedCategory: null,
  selectedBrand: null,
  priceRange: [0, 100000],
  sortBy: 'newest',
  isMobileMenuOpen: false,
  isCartOpen: false,

  setAppView: (appView) => set({ appView }),
  setCustomerView: (customerView) => set({ customerView }),
  setVendorView: (vendorView) => set({ vendorView }),
  setAdminView: (adminView) => set({ adminView }),
  setSelectedProductId: (id) => set({ selectedProductId: id }),
  setSelectedOrderId: (id) => set({ selectedOrderId: id }),
  setSelectedVendorId: (id) => set({ selectedVendorId: id }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSelectedBrand: (selectedBrand) => set({ selectedBrand }),
  setPriceRange: (priceRange) => set({ priceRange }),
  setSortBy: (sortBy) => set({ sortBy }),
  setMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),
  setCartOpen: (isCartOpen) => set({ isCartOpen }),

  navigateTo: (view, data) => {
    if (view.startsWith('vendor-')) {
      set({ vendorView: view as VendorView, ...data });
    } else if (view.startsWith('admin-')) {
      set({ adminView: view as AdminView, ...data });
    } else {
      set({ customerView: view as CustomerView, ...data, isMobileMenuOpen: false });
    }
  },
}));

// ============ CART STORE ============

interface CartState {
  items: Array<{
    productId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    vendorName: string;
    vendorId: string;
    stock: number;
  }>;
  couponCode: string | null;
  couponDiscount: number;
  addItem: (item: Omit<CartState['items'][0], 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getShipping: () => number;
  getTax: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      couponDiscount: 0,

      addItem: (item) => {
        const items = [...get().items];
        const existing = items.find((i) => i.productId === item.productId);
        if (existing) {
          existing.quantity = Math.min(existing.quantity + 1, item.stock);
        } else {
          items.push({ ...item, quantity: 1 });
        }
        set({ items });
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.productId !== productId) });
        } else {
          set({
            items: get().items.map((i) =>
              i.productId === productId ? { ...i, quantity: Math.min(quantity, i.stock) } : i
            ),
          });
        }
      },

      clearCart: () => set({ items: [], couponCode: null, couponDiscount: 0 }),
      applyCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),
      removeCoupon: () => set({ couponCode: null, couponDiscount: 0 }),
      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getShipping: () => {
        const subtotal = get().getSubtotal();
        return subtotal >= 500 ? 0 : 99;
      },
      getTax: () => get().getSubtotal() * 0.18,
      getTotal: () => {
        const subtotal = get().getSubtotal();
        const shipping = get().getShipping();
        const tax = get().getTax();
        const discount = get().couponDiscount;
        return Math.max(0, subtotal + shipping + tax - discount);
      },
    }),
    { name: 'marketplace-cart' }
  )
);

// ============ WISHLIST STORE ============

interface WishlistState {
  items: string[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  hasItem: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (productId) => {
        if (!get().items.includes(productId)) {
          set({ items: [...get().items, productId] });
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((id) => id !== productId) });
      },
      toggleItem: (productId) => {
        if (get().items.includes(productId)) {
          set({ items: get().items.filter((id) => id !== productId) });
        } else {
          set({ items: [...get().items, productId] });
        }
      },
      hasItem: (productId) => get().items.includes(productId),
    }),
    { name: 'marketplace-wishlist' }
  )
);

// ============ COMPARE STORE ============

interface CompareState {
  items: string[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  hasItem: (productId: string) => boolean;
  clearAll: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (productId) => {
        if (!get().items.includes(productId) && get().items.length < 4) {
          set({ items: [...get().items, productId] });
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((id) => id !== productId) });
      },
      toggleItem: (productId) => {
        if (get().items.includes(productId)) {
          set({ items: get().items.filter((id) => id !== productId) });
        } else if (get().items.length < 4) {
          set({ items: [...get().items, productId] });
        }
      },
      hasItem: (productId) => get().items.includes(productId),
      clearAll: () => set({ items: [] }),
    }),
    { name: 'marketplace-compare' }
  )
);

// ============ NOTIFICATION STORE ============

interface NotificationState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  markAllRead: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnread: () => set({ unreadCount: (n) => n + 1 }),
  markAllRead: () => set({ unreadCount: 0 }),
}));