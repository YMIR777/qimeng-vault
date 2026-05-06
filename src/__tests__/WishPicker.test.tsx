import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
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
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders list of wishes', async () => {
    render(
      <WishPicker
        amount={100}
        wishes={mockWishes}
        onDeposit={vi.fn()}
        onClose={vi.fn()}
      />
    );
    // Advance past animation delays (20ms + 80ms)
    await act(async () => { vi.advanceTimersByTime(200); });
    const wish1 = screen.getAllByText('新手机')[0];
    const wish2 = screen.getAllByText('演唱会')[0];
    expect(wish1).toBeTruthy();
    expect(wish2).toBeTruthy();
  });

  it('renders "不存入" button', async () => {
    render(
      <WishPicker
        amount={100}
        wishes={mockWishes}
        onDeposit={vi.fn()}
        onClose={vi.fn()}
      />
    );
    await act(async () => { vi.advanceTimersByTime(200); });
    const buttons = screen.getAllByText('不存入');
    expect(buttons[0]).toBeTruthy();
  });

  it('renders wish name and balance info', async () => {
    const onDeposit = vi.fn();
    render(
      <WishPicker
        amount={100}
        wishes={mockWishes}
        onDeposit={onDeposit}
        onClose={vi.fn()}
      />
    );
    await act(async () => { vi.advanceTimersByTime(200); });
    // Verify the first wish shows progress info
    const all3100 = screen.getAllByText('¥3,100 / ¥5,000');
    expect(all3100.length).toBeGreaterThan(0);
    expect(screen.getAllByText('¥100 / ¥800').length).toBeGreaterThan(0);
  });

  it('calls onClose when "不存入" is clicked', async () => {
    const onClose = vi.fn();
    render(
      <WishPicker
        amount={100}
        wishes={mockWishes}
        onDeposit={vi.fn()}
        onClose={onClose}
      />
    );
    await act(async () => { vi.advanceTimersByTime(500); });
    const buttons = screen.getAllByRole('button');
    await act(async () => { fireEvent.click(buttons[buttons.length - 1]); });
    expect(onClose).toHaveBeenCalled();
  });
});