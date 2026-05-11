import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock the db module before importing useRecurring
vi.mock('../store/db', () => {
  const mockToArray = vi.fn().mockResolvedValue([]);
  const mockAdd = vi.fn().mockResolvedValue(undefined);
  const mockUpdate = vi.fn().mockResolvedValue(undefined);
  const mockDelete = vi.fn().mockResolvedValue(undefined);
  return {
    db: {
      recurringRules: {
        toArray: mockToArray,
        add: mockAdd,
        update: mockUpdate,
        delete: mockDelete,
      },
      transactions: {
        add: vi.fn().mockResolvedValue(undefined),
      },
    },
    RecurringRule: {},
  };
});

// Import after mocking
import { useRecurring } from '../store/useRecurring';
import { db } from '../store/db';

describe('useRecurring hook', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(db.recurringRules.toArray).mockResolvedValue([]);
    vi.mocked(db.recurringRules.add).mockResolvedValue(undefined);
    vi.mocked(db.recurringRules.update).mockResolvedValue(0);
    vi.mocked(db.recurringRules.delete).mockResolvedValue(undefined);
    vi.mocked(db.transactions.add).mockResolvedValue(undefined);
  });

  it('initializes with empty rules', async () => {
    const { result } = renderHook(() => useRecurring());
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    expect(Array.isArray(result.current.rules)).toBe(true);
    expect(result.current.rules.length).toBe(0);
  });

  it('returns all CRUD functions', async () => {
    const { result } = renderHook(() => useRecurring());
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    expect(typeof result.current.addRule).toBe('function');
    expect(typeof result.current.updateRule).toBe('function');
    expect(typeof result.current.deleteRule).toBe('function');
    expect(typeof result.current.toggleActive).toBe('function');
    expect(typeof result.current.checkAndTrigger).toBe('function');
  });

  it('addRule creates a new rule', async () => {
    const ruleData = {
      name: '饿了么会员',
      amount: 25,
      type: 'expense' as const,
      category: '餐饮',
      accountId: 'acc-1',
      period: 'monthly' as const,
      dayOfMonth: 15,
      nextDue: Date.now(),
      active: true,
      autoRecord: true,
    };

    const { result } = renderHook(() => useRecurring());
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.addRule(ruleData);
    });

    expect(db.recurringRules.add).toHaveBeenCalled();
  });

  it('updateRule updates an existing rule', async () => {
    const existingRules = [
      {
        id: 'rule-1',
        name: '测试规则',
        amount: 100,
        type: 'expense' as const,
        accountId: 'acc-1',
        period: 'monthly' as const,
        dayOfMonth: 1,
        nextDue: Date.now(),
        active: true,
        lastTriggered: 0,
        autoRecord: false,
        createdAt: Date.now(),
      },
    ];
    vi.mocked(db.recurringRules.toArray).mockResolvedValue(existingRules);

    const { result } = renderHook(() => useRecurring());
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.updateRule('rule-1', { name: '更新后的规则', active: false });
    });

    expect(db.recurringRules.update).toHaveBeenCalledWith('rule-1', expect.objectContaining({
      name: '更新后的规则',
      active: false,
    }));
  });

  it('deleteRule removes a rule', async () => {
    const existingRules = [
      {
        id: 'rule-to-delete',
        name: '要删除的规则',
        amount: 50,
        type: 'expense' as const,
        accountId: 'acc-1',
        period: 'weekly' as const,
        dayOfWeek: 1,
        nextDue: Date.now(),
        active: true,
        lastTriggered: 0,
        autoRecord: true,
        createdAt: Date.now(),
      },
    ];
    vi.mocked(db.recurringRules.toArray).mockResolvedValue(existingRules);

    const { result } = renderHook(() => useRecurring());
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.deleteRule('rule-to-delete');
    });

    expect(db.recurringRules.delete).toHaveBeenCalledWith('rule-to-delete');
  });

  it('toggleActive flips active state', async () => {
    const existingRules = [
      {
        id: 'rule-toggle',
        name: '切换规则',
        amount: 200,
        type: 'income' as const,
        accountId: 'acc-1',
        period: 'yearly' as const,
        dayOfMonth: 1,
        nextDue: Date.now(),
        active: false,
        lastTriggered: 0,
        autoRecord: true,
        createdAt: Date.now(),
      },
    ];
    vi.mocked(db.recurringRules.toArray).mockResolvedValue(existingRules);

    const { result } = renderHook(() => useRecurring());
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.toggleActive('rule-toggle');
    });

    // Should toggle from false to true
    expect(db.recurringRules.update).toHaveBeenCalledWith('rule-toggle', expect.objectContaining({
      active: true,
    }));
  });

  it('checkAndTrigger triggers due rules and reschedules them', async () => {
    const now = Date.now();
    const pastDue = now - 1000 * 60 * 60; // 1 hour ago
    const existingRules = [
      {
        id: 'due-rule',
        name: '月度订阅',
        amount: 99,
        type: 'expense' as const,
        category: '娱乐',
        accountId: 'acc-1',
        period: 'monthly' as const,
        dayOfMonth: 10,
        nextDue: pastDue,
        active: true,
        lastTriggered: 0,
        autoRecord: true,
        createdAt: Date.now(),
      },
    ];
    vi.mocked(db.recurringRules.toArray).mockResolvedValue(existingRules);

    const { result } = renderHook(() => useRecurring());
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.checkAndTrigger();
    });

    // Should have recorded a transaction
    expect(db.transactions.add).toHaveBeenCalledWith(expect.objectContaining({
      type: 'expense',
      amount: 99,
      category: '娱乐',
      accountId: 'acc-1',
    }));

    // Should have updated the rule with new nextDue and lastTriggered
    expect(db.recurringRules.update).toHaveBeenCalledWith('due-rule', expect.objectContaining({
      lastTriggered: expect.any(Number),
      nextDue: expect.any(Number),
    }));
  });

  it('activeRules returns only active rules', async () => {
    const existingRules = [
      {
        id: 'active-rule',
        name: '活跃规则',
        amount: 50,
        type: 'expense' as const,
        accountId: 'acc-1',
        period: 'monthly' as const,
        dayOfMonth: 1,
        nextDue: Date.now(),
        active: true,
        lastTriggered: 0,
        autoRecord: false,
        createdAt: Date.now(),
      },
      {
        id: 'inactive-rule',
        name: '非活跃规则',
        amount: 50,
        type: 'expense' as const,
        accountId: 'acc-1',
        period: 'monthly' as const,
        dayOfMonth: 1,
        nextDue: Date.now(),
        active: false,
        lastTriggered: 0,
        autoRecord: false,
        createdAt: Date.now(),
      },
    ];
    vi.mocked(db.recurringRules.toArray).mockResolvedValue(existingRules);

    const { result } = renderHook(() => useRecurring());
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.activeRules.length).toBe(1);
    expect(result.current.activeRules[0].id).toBe('active-rule');
  });
});
