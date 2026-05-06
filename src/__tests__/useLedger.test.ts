import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLedger } from '../store/useLedger';

// Mock IndexedDB for test environment
const mockDb: any = {
  transactions: {
    toArray: vi.fn().mockResolvedValue([]),
    add: vi.fn().mockResolvedValue(undefined),
  },
  wishes: {
    toArray: vi.fn().mockResolvedValue([]),
  },
};

// We need to mock the db module before importing useLedger
vi.mock('../store/db', () => ({
  db: mockDb,
  Transaction: {},
}));

describe('useLedger hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.transactions.toArray.mockResolvedValue([]);
    mockDb.transactions.add.mockResolvedValue(undefined);
  });

  it('initializes with empty transactions', async () => {
    const { result } = renderHook(() => useLedger());
    // Wait for useEffect to run
    await act(async () => {});
    expect(Array.isArray(result.current.transactions)).toBe(true);
  });

  it('returns addTransaction function', async () => {
    const { result } = renderHook(() => useLedger());
    await act(async () => {});
    expect(typeof result.current.addTransaction).toBe('function');
  });
});