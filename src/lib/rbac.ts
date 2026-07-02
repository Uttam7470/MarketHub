export const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ['*'], // Full access
  FINANCE_ADMIN: ['payouts', 'wallet', 'revenue', 'coupons', 'reports', 'orders', 'analytics'],
  SUPPORT_ADMIN: ['tickets', 'returns', 'customers', 'faq', 'orders', 'support'],
  INVENTORY_ADMIN: ['products', 'categories', 'brands', 'stock', 'inventory'],
  ADMIN: ['*'],
  VENDOR: ['own_products', 'own_orders', 'own_wallet', 'own_reports'],
  CUSTOMER: ['own_orders', 'own_profile', 'cart', 'wishlist'],
};

export function hasPermission(userRole: string, adminRole: string | null, requiredPermission: string): boolean {
  const effectiveRole = adminRole || userRole;
  const permissions = ROLE_PERMISSIONS[effectiveRole];
  if (!permissions) return false;
  if (permissions.includes('*')) return true;
  return permissions.includes(requiredPermission);
}

export function requireAuth(req: Request, allowedRoles?: string[]): { authorized: boolean; error?: string } {
  // In a real app, verify JWT token here
  // For now, this is a helper that can be used in API routes
  return { authorized: true };
}