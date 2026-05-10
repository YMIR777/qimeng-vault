import { describe, it, expect } from 'vitest';
import { getSavingsRateInsight, getEmergencyFundInsight, getFreedomProgressInsight, WisdomLevel } from '../utils/wisdomEngine';

describe('wisdomEngine', () => {
  it('returns correct insight for excellent savings rate', () => {
    const result = getSavingsRateInsight(35);
    expect(result.level).toBe(WisdomLevel.EXCELLENT);
    expect(result.color).toBe('#7a9e7e');
  });

  it('returns danger for low savings rate', () => {
    const result = getSavingsRateInsight(5);
    expect(result.level).toBe(WisdomLevel.DANGER);
    expect(result.color).toBe('#d4a0a0');
  });

  it('returns emergency fund status', () => {
    const result = getEmergencyFundInsight(1.5);
    expect(result.level).toBe(WisdomLevel.WARNING);
    expect(result.months).toBe(1.5);
  });

  it('returns danger for low freedom progress', () => {
    const result = getFreedomProgressInsight(15);
    expect(result.level).toBe(WisdomLevel.DANGER);
    expect(result.message).toContain('起点');
  });
});
