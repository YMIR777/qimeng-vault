import { describe, it, expect } from 'vitest';
import {
  calcNetWorth,
  calcSavingsRate,
  calcEmergencyFundMonths,
  calcFreedomProgress,
  calcHourlyRate,
  calcTimeCost,
} from '../utils/financialHealth';

describe('financialHealth utils', () => {
  const mockTx = [
    { type: 'income', amount: 5000, date: Date.now(), platform: '比心', timeSpent: 240 },
    { type: 'expense', amount: 2000, date: Date.now(), category: '餐饮' },
    { type: 'expense', amount: 1000, date: Date.now(), category: '交通' },
    { type: 'income', amount: 3000, date: Date.now() - 30 * 24 * 60 * 60 * 1000, timeSpent: 180 },
    { type: 'expense', amount: 1500, date: Date.now() - 30 * 24 * 60 * 60 * 1000 },
  ];

  it('calculates net worth correctly', () => {
    expect(calcNetWorth(mockTx)).toBe(5000 + 3000 - 2000 - 1000 - 1500);
  });

  it('calculates savings rate for current month', () => {
    // Current month: income 5000, expense 3000 → savings rate = 40%
    expect(calcSavingsRate(mockTx, 'current')).toBeCloseTo(40, 1);
  });

  it('calculates emergency fund months', () => {
    // Net worth 3500 / avg monthly expense 4500 (over ~1 month since min=now-30d, max=now) ≈ 0.78
    expect(calcEmergencyFundMonths(mockTx)).toBeCloseTo(0.78, 1);
  });

  it('calculates hourly rate from income with time', () => {
    // Total income with time: 5000 + 3000 = 8000
    // Total minutes: 240 + 180 = 420
    // Hourly rate: 8000 / (420/60) = 1142.86
    expect(calcHourlyRate(mockTx)).toBeCloseTo(1143, 0);
  });

  it('calculates time cost for an expense', () => {
    // ¥299 item at ¥1143/hr → 299/1143*60 ≈ 15.7 minutes
    expect(calcTimeCost(299, 1143)).toBeCloseTo(15.7, 0);
  });

  it('calculates freedom progress', () => {
    // Net worth 3500 / (avg monthly expense 4500) = 0.78 months
    // Target: 6 months → 0.78/6 * 100 = 13%
    expect(calcFreedomProgress(mockTx, 6)).toBeCloseTo(13, 0);
  });
});
