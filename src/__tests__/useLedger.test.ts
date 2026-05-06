import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock the db module before importing useLedger
vi.mock('../store/db', () => {
  const mockAdd = vi.fn().mockResolvedValue(undefined);
  const mockToArray = vi.fn().mockResolvedValue([]);
  return {
    db: {
      transactions: {
        toArray: mockToArray,
        add: mockAdd,
      },
      wishes: {
        toArray: vi.fn().mockResolvedValue([]),
      },
    },
    Transaction: {},
  };
});

// Import after mocking
import { useLedger } from '../store/useLedger';
import { db } from '../store/db';

describe('useLedger hook', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset the mock to return empty array
    vi.mocked(db.transactions.toArray).mockResolvedValue([]);
    vi.mocked(db.transactions.add).mockResolvedValue(undefined);
  });

  it('initializes with empty transactions', async () => {
    const { result } = renderHook(() => useLedger());
    await act(async () => {
      // Wait for useEffect to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    expect(Array.isArray(result.current.transactions)).toBe(true);
  });

  it('returns addTransaction function', async () => {
    const { result } = renderHook(() => useLedger());
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    expect(typeof result.current.addTransaction).toBe('function');
  });
});