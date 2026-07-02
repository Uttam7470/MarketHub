export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone: string): boolean {
  return /^[0-9]{10}$/.test(phone.replace(/\D/g, ''));
}

export function validatePincode(pincode: string): boolean {
  return /^[0-9]{6}$/.test(pincode);
}

export function validateRequired(data: Record<string, any>, fields: string[]): string | null {
  for (const field of fields) {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      return `${field} is required`;
    }
  }
  return null;
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/<[^>]*>/g, '');
}

export function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 6) return { valid: false, message: 'Password must be at least 6 characters' };
  if (password.length > 128) return { valid: false, message: 'Password is too long' };
  return { valid: true, message: '' };
}