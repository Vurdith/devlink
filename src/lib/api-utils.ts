import { NextResponse } from "next/server";

export type ApiErrorBody = { error: string };
export type JsonObject = Record<string, unknown>;

export interface ApiErrorInterface {
  error: string;
  status: number;
}

export type JsonBodyResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; response: NextResponse<ApiErrorBody> };

export type JsonObjectBodyOptions = {
  invalidJsonMessage?: string;
  nonObjectMessage?: string;
};

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
    return apiErrorResponse(error.message, error.status);
  }
  
  if (error instanceof Error) {
    return apiErrorResponse("Internal server error", 500);
  }
  
  return apiErrorResponse("Internal server error", 500);
}

export function apiErrorResponse(error: string, status = 400): NextResponse<ApiErrorBody> {
  return NextResponse.json({ error }, { status });
}

export async function parseJsonBody<T = unknown>(
  request: Request,
  invalidMessage = "Invalid JSON body"
): Promise<JsonBodyResult<T>> {
  try {
    return { ok: true, data: (await request.json()) as T };
  } catch {
    return {
      ok: false,
      response: apiErrorResponse(invalidMessage, 400),
    };
  }
}

export async function parseJsonObjectBody<T extends JsonObject = JsonObject>(
  request: Request,
  options: JsonObjectBodyOptions = {}
): Promise<JsonBodyResult<T>> {
  const {
    invalidJsonMessage = "Invalid JSON body",
    nonObjectMessage = "Request body must be a JSON object",
  } = options;
  const parsed = await parseJsonBody<unknown>(request, invalidJsonMessage);

  if (!parsed.ok) {
    return parsed;
  }

  if (!isJsonObject(parsed.data)) {
    return {
      ok: false,
      response: apiErrorResponse(nonObjectMessage, 400),
    };
  }

  return { ok: true, data: parsed.data as T };
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
