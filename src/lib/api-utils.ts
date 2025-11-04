import { NextResponse } from "next/server";

export interface ApiErrorInterface {
  error: string;
  status: number;
}

export class ApiError extends Error {
  public status: number;

  constructor(message: string, status: number = 500) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error);
  
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  
  if (error instanceof Error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
  
  return NextResponse.json({ error: "Unknown error occurred" }, { status: 500 });
}

export function validateInput(data: Record<string, unknown>, schema: Record<string, Record<string, unknown>>): string | null {
  for (const [key, rules] of Object.entries(schema)) {
    const value = data[key];
    
    if (rules.required && (value === undefined || value === null || value === '')) {
      return `${key} is required`;
    }
    
    if (value !== undefined && value !== null) {
      if (rules.type && typeof value !== rules.type) {
        return `${key} must be of type ${rules.type}`;
      }
      
      if (rules.minLength && typeof value === 'string' && value.length < (rules.minLength as number)) {
        return `${key} must be at least ${rules.minLength} characters`;
      }
      
      if (rules.maxLength && typeof value === 'string' && value.length > (rules.maxLength as number)) {
        return `${key} must be no more than ${rules.maxLength} characters`;
      }
      
      if (rules.pattern && typeof value === 'string' && !(rules.pattern as RegExp).test(value)) {
        return `${key} format is invalid`;
      }
      
      if (rules.min && typeof value === 'number' && value < (rules.min as number)) {
        return `${key} must be at least ${rules.min}`;
      }
      
      if (rules.max && typeof value === 'number' && value > (rules.max as number)) {
        return `${key} must be no more than ${rules.max}`;
      }
    }
  }
  
  return null;
}

export const validationSchemas = {
  post: {
    content: { required: true, type: 'string', minLength: 1, maxLength: 2000 },
    mediaUrls: { type: 'object', maxLength: 10 },
    replyToId: { type: 'string' },
    isSlideshow: { type: 'boolean' }
  },
  user: {
    username: { required: true, type: 'string', minLength: 3, maxLength: 20, pattern: /^[a-zA-Z0-9_]+$/ },
    email: { required: true, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { required: true, type: 'string', minLength: 8 }
  },
  follow: {
    targetUserId: { required: true, type: 'string' }
  }
};
