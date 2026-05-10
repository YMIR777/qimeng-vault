import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { TimeCapsule } from '../components/reflection/TimeCapsule';

const lastMonthWorthy = [
  { id: '1', type: 'expense' as const, amount: 100, date: new Date('2026-04-15').getTime(), category: '餐饮', judgment: 'worthy' as const, note: '好吃的饭', createdAt: Date.now() },
  { id: '2', type: 'expense' as const, amount: 200, date: new Date('2026-04-20').getTime(), category: '数码', judgment: 'worthy' as const, note: '耳机', createdAt: Date.now() },
  { id: '3', type: 'expense' as const, amount: 50, date: new Date('2026-04-05').getTime(), category: '餐饮', judgment: 'worthy' as const, note: '奶茶', createdAt: Date.now() },
];

const thisMonthTx = [
  { id: '4', type: 'expense' as const, amount: 80, date: new Date('2026-05-05').getTime(), category: '交通', judgment: 'worthy' as const, note: '打车', createdAt: Date.now() },
];

function clickOpen() {
  const buttons = screen.getAllByText(/开启时间胶囊/);
  fireEvent.click(buttons[buttons.length - 1]);
}

afterEach(() => cleanup());

describe('TimeCapsule', () => {
  it('renders open button', () => {
    render(<TimeCapsule transactions={[]} updateTransaction={vi.fn()} />);
    expect(screen.queryAllByText(/开启时间胶囊/).length).toBeGreaterThanOrEqual(1);
  });

  it('shows last month worthy expenses when opened', () => {
    render(<TimeCapsule transactions={[...lastMonthWorthy, ...thisMonthTx]} updateTransaction={vi.fn()} />);
    clickOpen();
    expect(screen.queryAllByText(/好吃的饭/).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryAllByText(/耳机/).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryAllByText(/奶茶/).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryAllByText(/打车/).length).toBe(0);
  });

  it('displays regret rate', () => {
    render(<TimeCapsule transactions={lastMonthWorthy} updateTransaction={vi.fn()} />);
    clickOpen();
    expect(screen.queryAllByText(/后悔率/).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryAllByText(/0%/).length).toBeGreaterThanOrEqual(1);
  });

  it('shows category analysis', () => {
    render(<TimeCapsule transactions={lastMonthWorthy} updateTransaction={vi.fn()} />);
    clickOpen();
    expect(screen.queryAllByText(/餐饮/).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryAllByText(/数码/).length).toBeGreaterThanOrEqual(1);
  });

  it('calls updateTransaction when marking regret', async () => {
    const mockUpdate = vi.fn().mockResolvedValue(undefined);
    render(<TimeCapsule transactions={lastMonthWorthy} updateTransaction={mockUpdate} />);
    clickOpen();
    const buttons = screen.queryAllByText(/后悔了/);
    expect(buttons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(buttons[0]);
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockUpdate).toHaveBeenCalledWith(expect.any(String), { judgment: 'unworthy' });
  });
});
