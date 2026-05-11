import { useState, useMemo } from 'react';
import type { Transaction } from '../store/db';

export type TimeRange = 'all' | 'today' | 'week' | 'month' | 'custom';
export type SortOrder = 'newest' | 'oldest' | 'amountDesc' | 'amountAsc';

export interface CustomDateRange {
  start: number; // timestamp
  end: number;   // timestamp
}

export interface FilterState {
  timeRange: TimeRange;
  type: 'all' | 'income' | 'expense' | 'transfer';
  category: string;
  tagIds: string[];
  sort: SortOrder;
  customDateRange?: CustomDateRange;
}

export interface MonthlyStats {
  income: number;
  expense: number;
  net: number;
}

export interface UseRecordsFilterReturn {
  filterState: FilterState;
  setTimeRange: (range: TimeRange) => void;
  setCustomDateRange: (range: CustomDateRange) => void;
  setType: (type: FilterState['type']) => void;
  setCategory: (category: string) => void;
  setTagIds: (tagIds: string[]) => void;
  setSort: (sort: SortOrder) => void;
  filteredTransactions: Transaction[];
  monthlyStats: MonthlyStats;
}

function getTimeBounds(range: TimeRange, customRange?: CustomDateRange): { start: number; end: number } {
  const now = Date.now();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = todayStart.getTime() + 24 * 60 * 60 * 1000;

  switch (range) {
    case 'today':
      return { start: todayStart.getTime(), end: todayEnd };
    case 'week':
      return { start: todayStart.getTime() - 7 * 24 * 60 * 60 * 1000, end: todayEnd };
    case 'month':
      return { start: todayStart.getTime() - 30 * 24 * 60 * 60 * 1000, end: todayEnd };
    case 'custom':
      return customRange ?? { start: 0, end: now };
    case 'all':
    default:
      return { start: 0, end: now };
  }
}

const defaultState: FilterState = {
  timeRange: 'all',
  type: 'all',
  category: '',
  tagIds: [],
  sort: 'newest',
};

export function useRecordsFilter(transactions: Transaction[]): UseRecordsFilterReturn {
  const [filterState, setFilterState] = useState<FilterState>(defaultState);

  const setTimeRange = (timeRange: TimeRange) =>
    setFilterState(prev => ({ ...prev, timeRange }));

  const setCustomDateRange = (customDateRange: CustomDateRange) =>
    setFilterState(prev => ({ ...prev, customDateRange }));

  const setType = (type: FilterState['type']) =>
    setFilterState(prev => ({ ...prev, type }));

  const setCategory = (category: string) =>
    setFilterState(prev => ({ ...prev, category }));

  const setTagIds = (tagIds: string[]) =>
    setFilterState(prev => ({ ...prev, tagIds }));

  const setSort = (sort: SortOrder) =>
    setFilterState(prev => ({ ...prev, sort }));

  const filteredTransactions = useMemo(() => {
    const { start, end } = getTimeBounds(filterState.timeRange, filterState.customDateRange);

    let result = transactions.filter(t => t.date >= start && t.date < end);

    // Filter by type
    if (filterState.type !== 'all') {
      result = result.filter(t => t.type === filterState.type);
    }

    // Filter by category (case-insensitive partial match)
    if (filterState.category.trim()) {
      const catLower = filterState.category.toLowerCase();
      result = result.filter(t => t.category?.toLowerCase().includes(catLower));
    }

    // Filter by tags (OR logic — match ANY of the selected tags)
    if (filterState.tagIds.length > 0) {
      result = result.filter(t =>
        t.tags?.some(tagId => filterState.tagIds.includes(tagId))
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (filterState.sort) {
        case 'oldest':
          return a.date - b.date;
        case 'amountDesc':
          return b.amount - a.amount;
        case 'amountAsc':
          return a.amount - b.amount;
        case 'newest':
        default:
          return b.date - a.date;
      }
    });

    return result;
  }, [transactions, filterState]);

  const monthlyStats = useMemo<MonthlyStats>(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [filteredTransactions]);

  return {
    filterState,
    setTimeRange,
    setCustomDateRange,
    setType,
    setCategory,
    setTagIds,
    setSort,
    filteredTransactions,
    monthlyStats,
  };
}