import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Reports } from '../pages/Reports';

vi.mock('../store/useLedger', () => ({
  useLedger: () => ({
    transactions: [
      { id: '1', type: 'expense' as const, amount: 200, date: new Date(2026, 4, 5).getTime(), category: '餐饮' },
      { id: '2', type: 'expense' as const, amount: 50, date: new Date(2026, 4, 6).getTime(), category: '交通' },
      { id: '3', type: 'expense' as const, amount: 300, date: new Date(2026, 4, 7).getTime(), category: '设备升级' },
      { id: '4', type: 'expense' as const, amount: 150, date: new Date(2026, 4, 8).getTime(), category: '技能提升' },
      { id: '5', type: 'income' as const, amount: 1000, date: new Date(2026, 4, 5).getTime(), platform: '陪玩' },
      { id: '6', type: 'income' as const, amount: 500, date: new Date(2026, 4, 10).getTime(), platform: '直播' },
    ],
  }),
}));

vi.mock('gsap', () => ({
  default: {
    fromTo: vi.fn(),
    to: vi.fn(),
  },
}));

describe('Reports Optimized', () => {
  it('marks life investment categories with sprout icon', () => {
    const { container } = render(<Reports />);
    expect(container.textContent).toContain('🌱');
  });

  it('renders income channel compact pie chart', () => {
    const { container } = render(<Reports />);
    expect(container.textContent).toContain('收入渠道');
  });

  it('renders daily expense trend bar chart', () => {
    const { container } = render(<Reports />);
    expect(container.textContent).toContain('日均支出');
  });

  it('uses font-mono for numbers', () => {
    const { container } = render(<Reports />);
    const monoElements = container.querySelectorAll('.font-mono');
    expect(monoElements.length).toBeGreaterThan(0);
  });
});
