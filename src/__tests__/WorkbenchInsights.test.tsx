import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Workbench } from '../pages/Workbench';

const mockTransactions = [
  { id: '1', type: 'income', amount: 300, date: Date.now() - 1 * 24 * 60 * 60 * 1000, bossName: '老板A', timeSpent: 60, platform: '平台X' },
  { id: '2', type: 'income', amount: 500, date: Date.now() - 2 * 24 * 60 * 60 * 1000, bossName: '老板A', timeSpent: 90, platform: '平台X' },
  { id: '3', type: 'income', amount: 800, date: Date.now() - 3 * 24 * 60 * 60 * 1000, bossName: '老板B', timeSpent: 120, platform: '平台Y' },
  { id: '4', type: 'income', amount: 600, date: Date.now() - 5 * 24 * 60 * 60 * 1000, bossName: '老板C', timeSpent: 45, platform: '平台Y' },
  { id: '5', type: 'income', amount: 550, date: Date.now() - 6 * 24 * 60 * 60 * 1000, bossName: '老板B', timeSpent: 60, platform: '平台Z' },
  { id: '6', type: 'income', amount: 1000, date: Date.now() - 8 * 24 * 60 * 60 * 1000, bossName: '老板D', timeSpent: 180, platform: '平台Z' },
  { id: '7', type: 'expense', amount: 200, date: Date.now() - 1 * 24 * 60 * 60 * 1000 },
];

const mockWishes = [
  { id: 'w1', name: '愿望1', targetPrice: 5000, currentBalance: 2000, status: 'building' },
];

vi.mock('../store/useLedger', () => ({
  useLedger: () => ({ transactions: mockTransactions, totalAsset: 3550 }),
}));

vi.mock('../store/useWishes', () => ({
  useWishes: () => ({ wishes: mockWishes }),
}));

vi.mock('gsap', () => ({
  default: {
    to: vi.fn(),
    fromTo: vi.fn(),
  },
}));

describe('Workbench Insights', () => {
  it('renders work overview cards with correct metrics', () => {
    render(<Workbench />);
    
    expect(screen.queryAllByText(/工作天数/).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryAllByText(/最高单笔/).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryAllByText(/回头客/).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryAllByText(/平均订单/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders time analysis section', () => {
    render(<Workbench />);
    
    expect(screen.queryAllByText(/近7天收入热力/).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryAllByText(/工作时长趋势/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders customer value analysis section', () => {
    render(<Workbench />);
    
    expect(screen.queryAllByText(/客户构成/).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryAllByText(/老板分析/).length).toBeGreaterThanOrEqual(1);
  });
});
