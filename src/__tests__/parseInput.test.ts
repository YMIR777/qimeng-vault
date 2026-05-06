import { describe, it, expect } from 'vitest';
import { parseInput } from '../components/magic/parseInput';

describe('parseInput', () => {
  it('parses income: 比心150', () => {
    const result = parseInput('比心150');
    expect(result.type).toBe('income');
    expect(result.platform).toBe('比心');
    expect(result.amount).toBe(150);
    expect(result.complete).toBe(true);
  });

  it('parses income: 比心30老板小明', () => {
    const result = parseInput('比心30老板小明');
    expect(result.type).toBe('income');
    expect(result.platform).toBe('比心');
    expect(result.amount).toBe(30);
    expect(result.bossName).toBe('小明');
  });

  it('parses income: 老板小红 比心200', () => {
    const result = parseInput('老板小红 比心200');
    expect(result.type).toBe('income');
    expect(result.platform).toBe('比心');
    expect(result.bossName).toBe('小红');
    expect(result.amount).toBe(200);
  });

  it('parses expense: 打车30', () => {
    const result = parseInput('打车30');
    expect(result.type).toBe('expense');
    expect(result.amount).toBe(30);
    expect(result.category).toBe('交通');
    expect(result.complete).toBe(true);
  });

  it('parses expense: 吃饭花了45', () => {
    const result = parseInput('吃饭花了45');
    expect(result.type).toBe('expense');
    expect(result.amount).toBe(45);
    expect(result.category).toBe('餐饮');
  });

  it('marks income as incomplete when no platform', () => {
    const result = parseInput('150');
    expect(result.type).toBe('income');
    expect(result.complete).toBe(false);
    expect(result.missingFields).toContain('platform');
  });

  it('marks unrecognized as incomplete', () => {
    const result = parseInput('什么都不是');
    expect(result.type).toBe(null);
    expect(result.complete).toBe(false);
  });

  it('extracts timeSpent from hours/minutes', () => {
    const result = parseInput('比心200 2小时');
    expect(result.timeSpent).toBe(120);
  });
});
