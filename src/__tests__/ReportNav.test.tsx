import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ReportNav } from '../components/reports/ReportNav';

describe('ReportNav', () => {
  it('renders navigation items', () => {
    const { container } = render(<ReportNav activeSection="summary" onNavigate={() => {}} />);
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(5);
    const texts = Array.from(buttons).map(b => b.textContent);
    expect(texts).toContain('摘要');
    expect(texts).toContain('趋势');
    expect(texts).toContain('支出');
    expect(texts).toContain('收入');
    expect(texts).toContain('健康度');
  });

  it('calls onNavigate when clicked', () => {
    const mockNavigate = vi.fn();
    const { container } = render(<ReportNav activeSection="summary" onNavigate={mockNavigate} />);
    const buttons = container.querySelectorAll('button');
    const trendBtn = Array.from(buttons).find(b => b.textContent === '趋势');
    if (trendBtn) fireEvent.click(trendBtn);
    expect(mockNavigate).toHaveBeenCalledWith('trend');
  });
});
