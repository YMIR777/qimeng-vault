import { useState } from 'react';

export interface UseRecordsInfiniteOptions {
  pageSize?: number;
}

export interface UseRecordsInfiniteReturn<T> {
  visibleTransactions: T[];
  loadMore: () => void;
  hasMore: boolean;
  reset: () => void;
}

export function useRecordsInfinite<T>(
  allFilteredTransactions: T[],
  options: UseRecordsInfiniteOptions = {}
): UseRecordsInfiniteReturn<T> {
  const { pageSize = 200 } = options;
  const [displayCount, setDisplayCount] = useState(pageSize);

  const visibleTransactions = allFilteredTransactions.slice(0, displayCount);
  const hasMore = displayCount < allFilteredTransactions.length;

  const loadMore = () => {
    setDisplayCount((prev) => prev + pageSize);
  };

  const reset = () => {
    setDisplayCount(pageSize);
  };

  return {
    visibleTransactions,
    loadMore,
    hasMore,
    reset,
  };
}
