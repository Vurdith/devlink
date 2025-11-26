/**
 * Cursor-based pagination utilities
 * More efficient than offset-based pagination for large datasets
 * Prevents issues with data changing between requests
 */

import { Prisma } from '@prisma/client';

/**
 * Cursor pagination options
 */
export interface CursorPaginationOptions {
  cursor?: string;
  limit?: number;
  direction?: 'forward' | 'backward';
}

/**
 * Result of cursor pagination
 */
export interface CursorPaginationResult<T> {
  items: T[];
  nextCursor?: string;
  previousCursor?: string;
  hasMore: boolean;
  hasPrevious: boolean;
}

/**
 * Encode cursor for pagination
 * Cursor is a base64-encoded postId and timestamp
 */
export function encodeCursor(postId: string, createdAt: Date | string): string {
  const timestamp = typeof createdAt === 'string' 
    ? new Date(createdAt).getTime() 
    : createdAt.getTime();
  
  const cursorData = `${postId}:${timestamp}`;
  return Buffer.from(cursorData).toString('base64');
}

/**
 * Decode cursor for pagination
 */
export function decodeCursor(cursor: string): { postId: string; timestamp: number } {
  const cursorData = Buffer.from(cursor, 'base64').toString('utf-8');
  const [postId, timestamp] = cursorData.split(':');
  
  return {
    postId,
    timestamp: parseInt(timestamp, 10),
  };
}

/**
 * Build cursor pagination filter for Prisma
 * Works with cursor-based pagination
 */
export function buildCursorFilter(
  cursor?: string,
  direction: 'forward' | 'backward' = 'forward'
): Prisma.PostWhereInput | undefined {
  if (!cursor) return undefined;

  const { postId, timestamp } = decodeCursor(cursor);
  const cursorDate = new Date(timestamp);

  if (direction === 'forward') {
    // Get items AFTER the cursor (older items, since we're sorting by createdAt DESC)
    return {
      OR: [
        { createdAt: { lt: cursorDate } },
        {
          AND: [
            { createdAt: { equals: cursorDate } },
            { id: { lt: postId } }, // Use ID for tiebreaker
          ],
        },
      ],
    };
  } else {
    // Get items BEFORE the cursor (newer items)
    return {
      OR: [
        { createdAt: { gt: cursorDate } },
        {
          AND: [
            { createdAt: { equals: cursorDate } },
            { id: { gt: postId } },
          ],
        },
      ],
    };
  }
}

/**
 * Process cursor pagination result
 * Handles encoding of cursors for next/previous
 */
export function processCursorResult<T extends { id: string; createdAt: Date | string }>(
  items: T[],
  options: CursorPaginationOptions & { totalLimit?: number } = {}
): CursorPaginationResult<T> {
  const {
    cursor,
    limit = 20,
    direction = 'forward',
    totalLimit = limit + 1, // Fetch one extra to check if there are more
  } = options;

  // Check if there are more items
  const hasMore = items.length > limit;
  const hasPrevious = !!cursor && direction === 'forward';

  // Return only the requested amount
  const resultItems = items.slice(0, limit);

  // Calculate cursors
  const nextCursor =
    hasMore && resultItems.length > 0
      ? encodeCursor(
          resultItems[resultItems.length - 1].id,
          resultItems[resultItems.length - 1].createdAt
        )
      : undefined;

  const previousCursor =
    hasPrevious && resultItems.length > 0
      ? encodeCursor(resultItems[0].id, resultItems[0].createdAt)
      : undefined;

  return {
    items: resultItems,
    nextCursor,
    previousCursor,
    hasMore,
    hasPrevious,
  };
}

/**
 * Convert offset pagination to cursor pagination
 * Useful for migration from old pagination method
 */
export function offsetToCursor(offset: number, limit: number): string {
  // For compatibility, we use offset as the "cursor"
  // In production, you'd want to actually fetch the item at that offset
  const cursorData = offset.toString();
  return Buffer.from(cursorData).toString('base64');
}

/**
 * Convert cursor pagination back to offset
 * Useful for analytics or debugging
 */
export function cursorToOffset(cursor: string): number {
  const offsetStr = Buffer.from(cursor, 'base64').toString('utf-8');
  return parseInt(offsetStr, 10);
}

