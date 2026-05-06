import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WishDetail } from '../components/wishes/WishDetail';
import type { Wish, Transaction } from '../store/db';

vi.mock('../store/db', () => {
  return {
    db: {
      transactions: {
        where: vi.fn().mockReturnThis(),
        equals: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue([]),
      },
      wishes: {
        update: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
      },
    },
  };
});

const mockWish: Wish = {
  id: 'wish-1',
  name: '新手机',
  targetPrice: 5000,
  currentBalance: 3000,
  status: 'building',
  createdAt: Date.now(),
};

const mockTransactions: Transaction[] = [
  {
    id: 'tx-1',
    type: 'income',
    amount: 300,
    platform: '比心',
    wishId: 'wish-1',
    date: Date.now() - 86400000 * 2,
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'tx-2',
    type: 'income',
    amount: 200,
    platform: '比心',
    wishId: 'wish-1',
    date: Date.now() - 86400000,
    createdAt: Date.now() - 86400000,
  },
];

describe('WishDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders wish name and current balance', () => {
    render(
      <WishDetail
        wish={mockWish}
        transactions={mockTransactions}
        onDeposit={vi.fn()}
        onWithdraw={vi.fn()}
        onDelete={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText('新手机')).toBeTruthy();
    expect(screen.getByText(/¥3,000/)).toBeTruthy();
  });

  it('renders deposit and withdraw buttons', () => {
    render(
      <WishDetail
        wish={mockWish}
        transactions={mockTransactions}
        onDeposit={vi.fn()}
        onWithdraw={vi.fn()}
        onDelete={vi.fn()}
        onClose={vi.fn()}
      />
    );
    // '存入' appears as both section label and button — use getAllByText
    expect(screen.getAllByText('存入').length).toBeGreaterThan(0);
    expect(screen.getAllByText('取出').length).toBeGreaterThan(0);
  });

  it('renders transaction list', () => {
    render(
      <WishDetail
        wish={mockWish}
        transactions={mockTransactions}
        onDeposit={vi.fn()}
        onWithdraw={vi.fn()}
        onDelete={vi.fn()}
        onClose={vi.fn()}
      />
    );
    // Transaction list header (uppercase label)
    expect(screen.getAllByText('存入记录').length).toBeGreaterThan(0);
  });
});
