import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock the db module before importing useWishes
vi.mock('../store/db', () => {
  const mockAdd = vi.fn().mockResolvedValue(undefined);
  const mockGet = vi.fn();
  const mockUpdate = vi.fn().mockResolvedValue(undefined);
  const mockDelete = vi.fn().mockResolvedValue(undefined);
  const mockToArray = vi.fn().mockResolvedValue([]);
  return {
    db: {
      transactions: {
        toArray: vi.fn().mockResolvedValue([]),
      },
      wishes: {
        toArray: mockToArray,
        add: mockAdd,
        get: mockGet,
        update: mockUpdate,
        delete: mockDelete,
      },
    },
  };
});

// Import after mocking
import { useWishes } from '../store/useWishes';
import { db } from '../store/db';

describe('useWishes hook', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(db.wishes.toArray).mockResolvedValue([]);
    vi.mocked(db.wishes.add).mockResolvedValue(undefined);
    vi.mocked(db.wishes.get).mockResolvedValue(undefined as any);
    vi.mocked(db.wishes.update).mockResolvedValue(0);
    vi.mocked(db.wishes.delete).mockResolvedValue(undefined);
  });

  it('initializes with empty wishes', async () => {
    const { result } = renderHook(() => useWishes());
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    expect(Array.isArray(result.current.wishes)).toBe(true);
    expect(result.current.wishes).toHaveLength(0);
  });

  it('adds a wish', async () => {
    const mockWish = {
      id: 'test-id-1',
      name: 'Test Wish',
      targetPrice: 1000,
      currentBalance: 0,
      status: 'building' as const,
      createdAt: Date.now(),
    };
    vi.mocked(db.wishes.add).mockResolvedValue(undefined);
    vi.mocked(db.wishes.toArray).mockResolvedValue([mockWish]);

    const { result } = renderHook(() => useWishes());
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.addWish({ name: 'Test Wish', targetPrice: 1000 });
    });

    expect(db.wishes.add).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Wish',
        targetPrice: 1000,
        currentBalance: 0,
        status: 'building',
      })
    );
  });
});
