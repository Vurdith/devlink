/**
 * API Error Handling Utilities
 * Provides consistent error handling and response formatting
 * with proper JSON parsing error handling
 */

import { NextResponse } from 'next/server';

/**
 * Standard API error response format
 */
export interface ApiErrorResponse {
  error: string;
  message: string;
  status: number;
  code?: string;
  details?: Record<string, any>;
  timestamp: string;
}

/**
 * API error class
 */
export class ApiError extends Error {
  constructor(
    public status: number = 500,
    message: string = 'Internal Server Error',
    public code: string = 'INTERNAL_ERROR',
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Safe JSON parse with error handling
 * @param json JSON string to parse
 * @param defaultValue Default value if parsing fails
 */
export function safeJsonParse<T = any>(
  json: string,
  defaultValue: T | null = null
): T | null {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('JSON parse error:', error, 'Input:', json.substring(0, 100));
    return defaultValue;
  }
}

/**
 * Safe JSON stringify with error handling
 * @param obj Object to stringify
 * @param defaultValue Default value if stringify fails
 */
export function safeJsonStringify(
  obj: any,
  defaultValue: string = '{}'
): string {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.error('JSON stringify error:', error, 'Object:', obj);
    return defaultValue;
  }
}

/**
 * Safely parse API response with validation
 * @param response Fetch response
 * @param validateSchema Optional validation function
 */
export async function safeParseResponse<T = any>(
  response: Response,
  validateSchema?: (data: any) => boolean
): Promise<{ data: T | null; error: ApiError | null }> {
  try {
    // Check if response is ok
    if (!response.ok) {
      return {
        data: null,
        error: new ApiError(
          response.status,
          `HTTP ${response.status}: ${response.statusText}`,
          'HTTP_ERROR',
          { status: response.status }
        ),
      };
    }

    // Parse JSON safely
    const text = await response.text();
    const data = safeJsonParse<T>(text);

    if (data === null) {
      return {
        data: null,
        error: new ApiError(
          400,
          'Invalid JSON response',
          'INVALID_JSON',
          { received: text.substring(0, 100) }
        ),
      };
    }

    // Validate schema if provided
    if (validateSchema && !validateSchema(data)) {
      return {
        data: null,
        error: new ApiError(
          400,
          'Response does not match expected schema',
          'SCHEMA_VALIDATION_ERROR',
          { data }
        ),
      };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error parsing API response:', error);
    return {
      data: null,
      error: new ApiError(
        500,
        'Failed to parse API response',
        'PARSE_ERROR',
        { error: String(error) }
      ),
    };
  }
}

/**
 * Format error response for API
 */
export function formatErrorResponse(error: ApiError | Error): ApiErrorResponse {
  if (error instanceof ApiError) {
    return {
      error: error.code,
      message: error.message,
      status: error.status,
      code: error.code,
      details: error.details,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    error: 'INTERNAL_ERROR',
    message: error.message || 'An unexpected error occurred',
    status: 500,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Handle API route errors with consistent response
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error('API Error:', error);

  let apiError: ApiError;

  if (error instanceof ApiError) {
    apiError = error;
  } else if (error instanceof Error) {
    apiError = new ApiError(500, error.message, 'INTERNAL_ERROR');
  } else {
    apiError = new ApiError(500, 'An unexpected error occurred', 'INTERNAL_ERROR');
  }

  return NextResponse.json(formatErrorResponse(apiError), {
    status: apiError.status,
  });
}

/**
 * Safe async wrapper for API route handlers
 * Automatically handles errors and returns proper response
 */
export function apiCatch(
  handler: (req: Request) => Promise<NextResponse>
): (req: Request) => Promise<NextResponse> {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): { valid: boolean; error?: ApiError } {
  for (const field of requiredFields) {
    if (!data[field]) {
      return {
        valid: false,
        error: new ApiError(
          400,
          `Missing required field: ${field}`,
          'MISSING_FIELD',
          { field }
        ),
      };
    }
  }

  return { valid: true };
}

/**
 * Validate data type
 */
export function validateDataType(
  data: any,
  type: string
): { valid: boolean; error?: ApiError } {
  if (typeof data !== type) {
    return {
      valid: false,
      error: new ApiError(
        400,
        `Invalid type. Expected ${type}, got ${typeof data}`,
        'INVALID_TYPE',
        { expected: type, received: typeof data }
      ),
    };
  }

  return { valid: true };
}

