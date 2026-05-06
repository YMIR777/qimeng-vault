import { describe, it, expect } from 'vitest';
import { parseInput } from '../components/magic/parseInput';

describe('parseInput', () => {
  it('parses income: 比心150', () => {
    const result = parseInput('比心150');
    expect(result.type).toBe('income');
    expect(result.platform).toBe('比心');
    expect(result.amount).toBe(150);
    expect(result.complete).toBe(true);
    expect(result.note).toBe('比心150');
  });

  it('parses income: 比心30老板小明', () => {
    const result = parseInput('比心30老板小明');
    expect(result.type).toBe('income');
    expect(result.platform).toBe('比心');
    expect(result.amount).toBe(30);
    expect(result.bossName).toBe('小明');
    expect(result.note).toBe('比心30老板小明');
  });

  it('parses income: 老板小红 比心200', () => {
    const result = parseInput('老板小红 比心200');
    expect(result.type).toBe('income');
    expect(result.platform).toBe('比心');
    expect(result.bossName).toBe('小红');
    expect(result.amount).toBe(200);
  });

  it('parses income: 涵涵给我存了1000块', () => {
    const result = parseInput('涵涵给我存了1000块');
    expect(result.type).toBe('income');
    expect(result.amount).toBe(1000);
    // "块" should NOT affect direction
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
    expect(result.note).toBe('吃饭花了45');
  });

  it('parses expense: 黄焖鸡10块', () => {
    const result = parseInput('黄焖鸡10块');
    expect(result.type).toBe('expense');
    expect(result.amount).toBe(10);
    expect(result.category).toBe('餐饮');
    // "块" should not misclassify as income
  });

  it('marks as incomplete when direction is unclear', () => {
    const result = parseInput('150');
    expect(result.type).toBe(null);
    expect(result.complete).toBe(false);
    expect(result.missingFields).toContain('type');
  });

  it('extracts timeSpent from hours/minutes', () => {
    const result = parseInput('比心200 2小时');
    expect(result.timeSpent).toBe(120);
  });

  it('preserves full input as diary note', () => {
    const result = parseInput('今天涵涵给我存了1000块零花钱');
    expect(result.note).toBe('今天涵涵给我存了1000块零花钱');
    expect(result.amount).toBe(1000);
  });
});