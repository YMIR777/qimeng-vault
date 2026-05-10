import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FinancialSummary } from '../components/reports/FinancialSummary';

vi.mock('../utils/financialHealth', () => ({
  calcMonthlyStats: () => ({ income: 5000, expense: 3000, net: 2000, savingsRate: 40 }),
  calcEmergencyFundMonths: () => 2.5,
  calcHourlyRate: () => 120,
}));

vi.mock('../utils/wisdomEngine', () => ({
  getSavingsRateInsight: () => ({ level: 'good', message: '金鹅在长大', color: '#7a9e7e' }),
  getEmergencyFundInsight: () => ({ level: 'warning', message: '继续积累', color: '#c9923a' }),
  WisdomLevel: { EXCELLENT: 'excellent', GOOD: 'good' },
}));

describe('FinancialSummary', () => {
  it('renders summary cards', () => {
    const { container } = render(<FinancialSummary transactions={[]} />);
    const text = container.textContent || '';
    expect(text).toContain('本月收入');
    expect(text).toContain('本月支出');
    expect(text).toContain('净结余');
    expect(text).toContain('储蓄率');
  });
});
