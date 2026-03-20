import { NextResponse } from "next/server";

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data?: T;
  message?: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export function apiError(error: string, code?: string, status = 400): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { success: false, error, code },
    { status }
  );
}

export function apiSuccess<T>(data?: T, message?: string, status = 200): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = { success: true };
  if (data !== undefined) response.data = data;
  if (message) response.message = message;
  return NextResponse.json(response, { status });
}

export function apiPaginated<T>(
  items: T[],
  options: {
    page: number;
    limit: number;
    total: number;
    nextCursor?: string | null;
  }
): NextResponse {
  const { page, limit, total, nextCursor } = options;
  return NextResponse.json({
    success: true,
    data: items,
    pagination: {
      page,
      limit,
      total,
      hasMore: nextCursor !== null && nextCursor !== undefined,
      nextCursor,
    },
  });
}

export const ErrorCodes = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  CONFLICT: "CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
