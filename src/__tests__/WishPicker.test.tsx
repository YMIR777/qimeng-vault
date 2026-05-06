import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WishPicker } from '../components/wishes/WishPicker';
import type { Wish } from '../store/db';

// Mock db
vi.mock('../store/db', () => {
  return {
    db: {
      wishes: {
        toArray: vi.fn().mockResolvedValue([]),
        update: vi.fn().mockResolvedValue(undefined),
      },
    },
  };
});

vi.mock('../store/useWishes', () => ({
  useWishes: () => ({
    wishes: [],
    depositToWish: vi.fn(),
  }),
}));

const mockWishes: Wish[] = [
  {
    id: 'wish-1',
    name: '新手机',
    targetPrice: 5000,
    currentBalance: 3000,
    status: 'building',
    createdAt: Date.now(),
  },
  {
    id: 'wish-2',
    name: '演唱会',
    targetPrice: 800,
    currentBalance: 0,
    status: 'building',
    createdAt: Date.now(),
  },
];

describe('WishPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders list of wishes', () => {
    render(
      <WishPicker
        amount={100}
        wishes={mockWishes}
        onDeposit={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText('新手机')).toBeTruthy();
    expect(screen.getByText('演唱会')).toBeTruthy();
  });

  it('renders "不存入" button', () => {
    render(
      <WishPicker
        amount={100}
        wishes={mockWishes}
        onDeposit={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText('不存入')).toBeTruthy();
  });

  it('calls onDeposit with wish id when wish is tapped', () => {
    const onDeposit = vi.fn();
    render(
      <WishPicker
        amount={100}
        wishes={mockWishes}
        onDeposit={onDeposit}
        onClose={vi.fn()}
      />
    );
    const wishCard = screen.getByText('新手机').closest('div');
    fireEvent.click(wishCard!);
    expect(onDeposit).toHaveBeenCalledWith('wish-1', 100);
  });

  it('calls onClose when "不存入" is clicked', () => {
    const onClose = vi.fn();
    render(
      <WishPicker
        amount={100}
        wishes={mockWishes}
        onDeposit={vi.fn()}
        onClose={onClose}
      />
    );
    fireEvent.click(screen.getByText('不存入'));
    expect(onClose).toHaveBeenCalled();
  });
});