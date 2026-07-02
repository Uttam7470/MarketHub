// Simple in-memory rate limiting and login attempt tracking

interface LoginAttempt {
  count: number;
  firstAttempt: number;
  lockoutUntil: number | null;
}

const loginAttempts = new Map<string, LoginAttempt>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export function checkLoginAttempts(email: string): { allowed: boolean; attemptsLeft: number; lockoutUntil?: number } {
  const entry = loginAttempts.get(email.toLowerCase());

  if (!entry) return { allowed: true, attemptsLeft: MAX_ATTEMPTS };

  if (entry.lockoutUntil) {
    if (Date.now() < entry.lockoutUntil) {
      return { allowed: false, attemptsLeft: 0, lockoutUntil: entry.lockoutUntil };
    }
    // Lockout expired, reset
    loginAttempts.delete(email.toLowerCase());
    return { allowed: true, attemptsLeft: MAX_ATTEMPTS };
  }

  return { allowed: true, attemptsLeft: MAX_ATTEMPTS - entry.count };
}

export function recordFailedLogin(email: string): void {
  const key = email.toLowerCase();
  const entry = loginAttempts.get(key);

  if (!entry) {
    loginAttempts.set(key, { count: 1, firstAttempt: Date.now(), lockoutUntil: null });
  } else {
    entry.count++;
    if (entry.count >= MAX_ATTEMPTS) {
      entry.lockoutUntil = Date.now() + LOCKOUT_DURATION;
    }
  }
}

export function recordSuccessfulLogin(email: string): void {
  loginAttempts.delete(email.toLowerCase());
}

// Simple IP-based rate limiter for API routes
interface RateLimitEntry {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function rateLimit(ip: string, maxRequests: number, windowMs: number = 60000): { allowed: boolean; retryAfter?: number } {
  const key = ip;
  const now = Date.now();
  let entry = rateLimitStore.get(key);

  if (!entry) {
    entry = { timestamps: [] };
    rateLimitStore.set(key, entry);
  }

  // Remove old entries outside the window
  entry.timestamps = entry.timestamps.filter(t => now - t < windowMs);

  if (entry.timestamps.length >= maxRequests) {
    const oldest = entry.timestamps[0];
    const retryAfter = Math.ceil((oldest + windowMs - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.timestamps.push(now);
  return { allowed: true };
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    entry.timestamps = entry.timestamps.filter(t => now - t < 120000);
    if (entry.timestamps.length === 0) rateLimitStore.delete(key);
  }
}, 300000);