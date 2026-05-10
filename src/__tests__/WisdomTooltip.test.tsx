import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { WisdomTooltip } from '../components/ui/WisdomTooltip';

describe('WisdomTooltip', () => {
  it('renders trigger element', () => {
    const { container } = render(<WisdomTooltip wisdom="Test wisdom"><span>Hover me</span></WisdomTooltip>);
    expect(container.querySelector('span')).toBeTruthy();
  });

  it('shows tooltip on hover', () => {
    const { container } = render(<WisdomTooltip wisdom="金鹅理论"><span>Hover me</span></WisdomTooltip>);
    const span = container.querySelector('span')!;
    fireEvent.mouseEnter(span);
    expect(container.querySelector('div')).toBeTruthy();
  });
});
