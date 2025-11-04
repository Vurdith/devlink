/**
 * Input validation and sanitization utilities
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface SanitizedInput {
  value: string;
  original: string;
}

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize text input (removes dangerous characters)
 */
export function sanitizeText(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .slice(0, 10000); // Limit length
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please enter a valid email address');
  } else if (email.length > 254) {
    errors.push('Email is too long');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate username
 */
export function validateUsername(username: string): ValidationResult {
  const errors: string[] = [];
  
  if (!username) {
    errors.push('Username is required');
  } else if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  } else if (username.length > 30) {
    errors.push('Username must be less than 30 characters');
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, and underscores');
  } else if (username.startsWith('_') || username.endsWith('_')) {
    errors.push('Username cannot start or end with underscore');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate password
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else if (password.length > 128) {
    errors.push('Password is too long');
  } else if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate post content
 */
export function validatePostContent(content: string): ValidationResult {
  const errors: string[] = [];
  
  if (!content || content.trim().length === 0) {
    errors.push('Post content is required');
  } else if (content.length > 10000) {
    errors.push('Post content is too long (max 10,000 characters)');
  } else if (content.trim().length < 1) {
    errors.push('Post content cannot be empty');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate URL
 */
export function validateUrl(url: string): ValidationResult {
  const errors: string[] = [];
  
  if (!url) {
    errors.push('URL is required');
  } else {
    try {
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        errors.push('URL must use HTTP or HTTPS protocol');
      }
    } catch {
      errors.push('Please enter a valid URL');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate hashtag
 */
export function validateHashtag(hashtag: string): ValidationResult {
  const errors: string[] = [];
  
  if (!hashtag) {
    errors.push('Hashtag is required');
  } else if (hashtag.length > 50) {
    errors.push('Hashtag is too long');
  } else if (!/^[a-zA-Z0-9_]+$/.test(hashtag)) {
    errors.push('Hashtag can only contain letters, numbers, and underscores');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize and validate input
 */
export function sanitizeAndValidate(input: string, type: 'text' | 'html' | 'email' | 'username' | 'password' | 'post' | 'url' | 'hashtag'): {
  sanitized: string;
  validation: ValidationResult;
} {
  let sanitized: string;
  
  switch (type) {
    case 'html':
      sanitized = sanitizeHtml(input);
      break;
    case 'email':
      sanitized = input.trim().toLowerCase();
      break;
    case 'username':
      sanitized = input.trim().toLowerCase();
      break;
    case 'password':
      sanitized = input; // Don't sanitize passwords
      break;
    case 'post':
      sanitized = sanitizeText(input);
      break;
    case 'url':
      sanitized = input.trim();
      break;
    case 'hashtag':
      sanitized = input.trim().toLowerCase();
      break;
    default:
      sanitized = sanitizeText(input);
  }
  
  let validation: ValidationResult;
  
  switch (type) {
    case 'email':
      validation = validateEmail(sanitized);
      break;
    case 'username':
      validation = validateUsername(sanitized);
      break;
    case 'password':
      validation = validatePassword(sanitized);
      break;
    case 'post':
      validation = validatePostContent(sanitized);
      break;
    case 'url':
      validation = validateUrl(sanitized);
      break;
    case 'hashtag':
      validation = validateHashtag(sanitized);
      break;
    default:
      validation = { isValid: true, errors: [] };
  }
  
  return { sanitized, validation };
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    // Add current attempt
    validAttempts.push(now);
    this.attempts.set(identifier, validAttempts);
    
    return true;
  }
  
  getRemainingTime(identifier: string): number {
    const attempts = this.attempts.get(identifier) || [];
    if (attempts.length === 0) return 0;
    
    const oldestAttempt = Math.min(...attempts);
    const resetTime = oldestAttempt + this.windowMs;
    return Math.max(0, resetTime - Date.now());
  }
}










