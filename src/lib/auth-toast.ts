/**
 * Centralized Authentication Toast Notifications
 *
 * Every auth-related action should use these helpers
 * instead of raw toast.success/error calls, ensuring
 * consistent, descriptive, and user-friendly messages.
 */
import { toast } from '@/lib/sonner';

// ============ SUCCESS NOTIFICATIONS ============

export const authToast = {
  /** User logged in successfully */
  loginSuccess: (name: string, role?: string) => {
    const roleLabel = role === 'ADMIN' ? ' as Admin' : role === 'VENDOR' ? ' (Vendor)' : '';
    toast.success(`Successfully logged in`, {
      description: `Welcome back, ${name}${roleLabel}!`,
      duration: 4000,
    });
  },

  /** User logged out successfully */
  logoutSuccess: () => {
    toast.success('Successfully logged out', {
      description: 'You have been signed out of your account.',
      duration: 3000,
    });
  },

  /** Customer registration completed */
  registerSuccess: (name: string) => {
    toast.success('Registration completed successfully', {
      description: `Welcome to MarketHub, ${name}!`,
      duration: 4000,
    });
  },

  /** Vendor application submitted */
  vendorApplicationSubmitted: (businessName: string) => {
    toast.success('Vendor application submitted successfully', {
      description: `${businessName} is pending admin approval. You'll be notified within 24-48 hours.`,
      duration: 6000,
    });
  },

  /** Password changed successfully */
  passwordChanged: () => {
    toast.success('Password changed successfully', {
      description: 'Your password has been updated. Use the new password on your next login.',
      duration: 4000,
    });
  },

  /** Profile updated successfully */
  profileUpdated: () => {
    toast.success('Profile updated successfully', {
      description: 'Your profile changes have been saved.',
      duration: 3000,
    });
  },

  /** Password reset email sent */
  passwordResetEmailSent: (email: string) => {
    toast.success('Password reset email sent', {
      description: `Check your inbox at ${email} for the reset link.`,
      duration: 5000,
    });
  },

  /** Account verified successfully */
  accountVerified: () => {
    toast.success('Account verified successfully', {
      description: 'Your account is now verified. You have full access to all features.',
      duration: 4000,
    });
  },
};

// ============ ERROR NOTIFICATIONS ============

/** Map raw API error strings to user-friendly toast messages */
export function getAuthErrorMessage(rawError: string, httpStatus?: number): string {
  const msg = rawError.toLowerCase();

  // Account lockout
  if (msg.includes('locked') || msg.includes('too many failed') || httpStatus === 429) {
    return 'Account locked due to too many failed attempts. Please wait and try again later.';
  }

  // Account suspended / deactivated
  if (msg.includes('suspended')) {
    return 'Account suspended. Please contact support for assistance.';
  }
  if (msg.includes('deactivated')) {
    return 'Account is deactivated. Please contact support to reactivate.';
  }

  // Invalid credentials
  if (msg.includes('invalid credentials') || msg.includes('incorrect credentials') || httpStatus === 401) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }

  // Account not found
  if (msg.includes('not found') || msg.includes('no account')) {
    return 'Account not found. Please check your email or register for a new account.';
  }

  // Email already registered
  if (msg.includes('email already') || msg.includes('already registered') || httpStatus === 409) {
    return 'Email already registered. Please log in or use a different email address.';
  }

  // Passwords do not match
  if (msg.includes('passwords do not match') || msg.includes('password mismatch')) {
    return 'Passwords do not match. Please re-enter and confirm your password.';
  }

  // Current password incorrect
  if (msg.includes('current password is incorrect') || msg.includes('wrong password')) {
    return 'Current password is incorrect. Please enter the correct password.';
  }

  // Password too short
  if (msg.includes('password must be at least') || msg.includes('too short')) {
    return 'Password must be at least 6 characters long.';
  }

  // Unauthorized / session expired
  if (msg.includes('unauthorized') || msg.includes('session expired') || httpStatus === 403) {
    return 'Unauthorized access. Your session may have expired. Please log in again.';
  }

  // Vendor specific
  if (msg.includes('vendor approval pending') || msg.includes('pending approval')) {
    return 'Vendor approval pending. Your application is still under review by our admin team.';
  }
  if (msg.includes('vendor application rejected') || msg.includes('rejected')) {
    return 'Vendor application rejected. Please contact admin for details or re-apply.';
  }

  // Missing fields
  if (msg.includes('required') || httpStatus === 400) {
    return rawError; // Return the original since it's a validation message
  }

  // Default fallback
  return rawError || 'An unexpected error occurred. Please try again.';
}

/** Show an auth error toast with a mapped user-friendly message */
export function authErrorToast(rawError: string, httpStatus?: number) {
  const message = getAuthErrorMessage(rawError, httpStatus);
  toast.error(message, {
    duration: 5000,
  });
}

/** Show a vendor status warning toast */
export function vendorStatusToast(status: string, rejectionReason?: string | null) {
  if (status === 'PENDING') {
    toast.warning('Vendor approval pending', {
      description: 'Your vendor account is under review. You will be notified once approved.',
      duration: 5000,
    });
  } else if (status === 'REJECTED') {
    toast.error('Vendor application rejected', {
      description: rejectionReason
        ? `Reason: ${rejectionReason}`
        : 'Your application was not approved. Please contact admin for details.',
      duration: 7000,
    });
  }
}