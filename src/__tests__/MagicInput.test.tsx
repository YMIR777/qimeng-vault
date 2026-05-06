import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MagicInput } from '../components/magic/MagicInput';
import { ParseResult } from '../components/magic/parseInput';

describe('MagicInput', () => {
  it('renders input field', () => {
    const { container } = render(<MagicInput onSubmit={async () => {}} />);
    expect(within(container).getByRole('textbox')).toBeTruthy();
  });

  it('calls onSubmit with parsed result on Enter', () => {
    let submitted: ParseResult | null = null;
    const { container } = render(<MagicInput onSubmit={(r) => { submitted = r; }} />);
    const input = within(container).getByRole('textbox');
    fireEvent.change(input, { target: { value: '比心150' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(submitted).not.toBeNull();
    expect(submitted!.type).toBe('income');
  });
});