'use client';

import { memo, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface TimeAgoProps {
  date: string | Date;
  className?: string;
}

// Memoized TimeAgo - calculates once, no intervals (saves CPU)
export const TimeAgo = memo(function TimeAgo({ date, className }: TimeAgoProps) {
  const timeAgo = useMemo(() => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return '';
    }
  }, [date]);

  return <span className={className}>{timeAgo}</span>;
});
