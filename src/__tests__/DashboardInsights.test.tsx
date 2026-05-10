import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from '../pages/Dashboard';

const today = new Date();
today.setHours(0, 0, 0, 0);
const todayTs = today.getTime();

const mockTransactions = [
  { id: '1', type: 'income', amount: 150, date: todayTs + 2 * 60 * 60 * 1000, bossName: '老板A', timeSpent: 60, platform: '比心' },
  { id: '2', type: 'income', amount: 200, date: todayTs + 5 * 60 * 60 * 1000, bossName: '老板B', timeSpent: 90, platform: '比心' },
  { id: '3', type: 'expense', amount: 30, date: todayTs + 6 * 60 * 60 * 1000, category: '餐饮' },
  { id: '4', type: 'income', amount: 300, date: todayTs - 1 * 24 * 60 * 60 * 1000, bossName: '老板C', timeSpent: 120, platform: '比心' },
];

const mockWishes = [
  { id: 'w1', name: '新电脑', targetPrice: 8000, currentBalance: 3500, status: 'building' },
  { id: 'w2', name: '旅行基金', targetPrice: 5000, currentBalance: 4800, status: 'building' },
];

vi.mock('../store/useLedger', () => ({
  useLedger: () => ({ transactions: mockTransactions, totalAsset: 3920, addTransaction: vi.fn(), updateTransaction: vi.fn() }),
}));

vi.mock('../store/useWishes', () => ({
  useWishes: () => ({ wishes: mockWishes, depositToWish: vi.fn() }),
}));

vi.mock('../store/useAccounts', () => ({
  useAccounts: () => ({ accounts: [] }),
}));

vi.mock('../store/useBudgets', () => ({
  useBudgets: () => ({ budgets: [] }),
}));

vi.mock('../components/ui/Toast', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock('gsap', () => ({
  default: {
    to: vi.fn(),
    fromTo: vi.fn(),
  },
}));

describe('Dashboard Insights', () => {
  it('renders daily work motivation card with hours and earnings', () => {
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    expect(screen.queryAllByText(/今日已工作/).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryAllByText(/赚了/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders weekly goal progress bar', () => {
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    expect(screen.queryAllByText(/本周目标/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders wish bottle quick view with latest wish progress', () => {
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    expect(screen.queryAllByText(/许愿瓶/).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryAllByText(/新电脑/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders fast record entry button', () => {
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    expect(screen.queryAllByText(/快速记账/).length).toBeGreaterThanOrEqual(1);
  });
});
