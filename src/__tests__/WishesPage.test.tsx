import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock db before importing anything else
vi.mock('../store/db', () => {
  const mockToArray = vi.fn().mockResolvedValue([]);
  const mockAdd = vi.fn().mockResolvedValue(undefined);
  const mockGet = vi.fn();
  const mockUpdate = vi.fn().mockResolvedValue(undefined);
  const mockDelete = vi.fn().mockResolvedValue(undefined);
  return {
    db: {
      transactions: { toArray: vi.fn().mockResolvedValue([]) },
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

import { db } from '../store/db';

describe('Wishes Page', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(db.wishes.toArray).mockResolvedValue([]);
    vi.mocked(db.wishes.add).mockResolvedValue(undefined);
  });

  it('renders "欲望星体" heading', async () => {
    const { Wishes } = await import('../pages/Wishes');
    render(<Wishes />);
    expect(screen.getByRole('heading', { name: '欲望星体' })).toBeTruthy();
  });

  it('shows empty state when no wishes exist', async () => {
    vi.mocked(db.wishes.toArray).mockResolvedValue([]);
    const { Wishes } = await import('../pages/Wishes');
    render(<Wishes />);
    // Wait for useWishes to resolve
    await new Promise(resolve => setTimeout(resolve, 50));
    // In StrictMode tests, the component renders twice — check at least one exists
    const emptyTexts = screen.queryAllByText('暂无星体');
    expect(emptyTexts.length).toBeGreaterThan(0);
  });
});
