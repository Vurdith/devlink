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
 * Validate ID (used for post IDs, user IDs, etc.)
 */
export function validateId(id: string): ValidationResult {
  const errors: string[] = [];
  
  if (!id) {
    errors.push('ID is required');
  } else if (id.length > 100) {
    errors.push('ID is too long');
  } else if (!/^[a-zA-Z0-9\-_]+$/.test(id)) {
    errors.push('Invalid ID format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate review rating
 */
export function validateRating(rating: number): ValidationResult {
  const errors: string[] = [];
  
  if (typeof rating !== 'number' || Number.isNaN(rating)) {
    errors.push('Rating must be a number');
  } else if (rating < 1 || rating > 5) {
    errors.push('Rating must be between 1 and 5');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate portfolio title
 */
export function validatePortfolioTitle(title: string): ValidationResult {
  const errors: string[] = [];
  
  if (!title || title.trim().length === 0) {
    errors.push('Title is required');
  } else if (title.length > 200) {
    errors.push('Title must be less than 200 characters');
  } else if (title.length < 3) {
    errors.push('Title must be at least 3 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate portfolio description
 */
export function validatePortfolioDescription(description: string): ValidationResult {
  const errors: string[] = [];
  
  if (description && description.length > 5000) {
    errors.push('Description must be less than 5000 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate array of URLs
 */
export function validateUrlArray(urls: unknown): ValidationResult {
  const errors: string[] = [];
  
  if (!Array.isArray(urls)) {
    errors.push('URLs must be an array');
  } else if (urls.length > 10) {
    errors.push('Maximum 10 URLs allowed');
  } else {
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      if (typeof url !== 'string') {
        errors.push(`URL at index ${i} must be a string`);
      } else if (url.length > 2048) {
        errors.push(`URL at index ${i} is too long`);
      } else {
        const validation = validateUrl(url);
        if (!validation.isValid) {
          errors.push(`URL at index ${i}: ${validation.errors.join(', ')}`);
        }
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate poll data
 */
export function validatePollData(pollData: unknown): ValidationResult {
  const errors: string[] = [];
  
  if (pollData === null || pollData === undefined) {
    return { isValid: true, errors: [] };
  }
  
  if (typeof pollData !== 'object' || !('question' in pollData) || !('options' in pollData)) {
    errors.push('Invalid poll structure');
    return { isValid: false, errors };
  }
  
  const poll = pollData as Record<string, unknown>;
  
  if (!poll.question || typeof poll.question !== 'string') {
    errors.push('Poll question is required and must be a string');
  } else if ((poll.question as string).length > 500) {
    errors.push('Poll question must be less than 500 characters');
  } else if ((poll.question as string).length < 3) {
    errors.push('Poll question must be at least 3 characters');
  }
  
  if (!Array.isArray(poll.options) || (poll.options as unknown[]).length === 0) {
    errors.push('Poll must have at least one option');
  } else if ((poll.options as unknown[]).length > 10) {
    errors.push('Poll must have at most 10 options');
  } else {
    for (let i = 0; i < (poll.options as unknown[]).length; i++) {
      const option = (poll.options as Record<string, unknown>[])[i];
      if (!option.text || typeof option.text !== 'string') {
        errors.push(`Poll option ${i + 1} text is required and must be a string`);
      } else if ((option.text as string).length > 200) {
        errors.push(`Poll option ${i + 1} text must be less than 200 characters`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateJobTitle(title: string): ValidationResult {
  const errors: string[] = [];
  if (!title || title.trim().length === 0) {
    errors.push("Job title is required");
  } else if (title.length < 3) {
    errors.push("Job title must be at least 3 characters");
  } else if (title.length > 120) {
    errors.push("Job title must be less than 120 characters");
  }
  return { isValid: errors.length === 0, errors };
}

export function validateJobDescription(description: string): ValidationResult {
  const errors: string[] = [];
  if (!description || description.trim().length === 0) {
    errors.push("Job description is required");
  } else if (description.length < 20) {
    errors.push("Job description must be at least 20 characters");
  } else if (description.length > 5000) {
    errors.push("Job description must be less than 5000 characters");
  }
  return { isValid: errors.length === 0, errors };
}

export function validateMessageContent(content: string): ValidationResult {
  const errors: string[] = [];
  if (!content || content.trim().length === 0) {
    errors.push("Message cannot be empty");
  } else if (content.length > 2000) {
    errors.push("Message must be less than 2000 characters");
  }
  return { isValid: errors.length === 0, errors };
}

export function validateEscrowAmount(amount: number): ValidationResult {
  const errors: string[] = [];
  if (typeof amount !== "number" || Number.isNaN(amount)) {
    errors.push("Amount must be a number");
  } else if (amount <= 0) {
    errors.push("Amount must be greater than zero");
  } else if (amount > 100000000) {
    errors.push("Amount is too large");
  }
  return { isValid: errors.length === 0, errors };
}

export function validateCurrency(currency: string): ValidationResult {
  const errors: string[] = [];
  if (!currency || currency.trim().length === 0) {
    errors.push("Currency is required");
  } else if (!/^[A-Z]{3}$/.test(currency.trim().toUpperCase())) {
    errors.push("Currency must be a 3-letter code");
  }
  return { isValid: errors.length === 0, errors };
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











