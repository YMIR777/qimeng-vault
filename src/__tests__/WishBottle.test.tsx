import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { WishBottle } from '../components/wishes/WishBottle';

describe('WishBottle', () => {
  it('renders SVG bottle', () => {
    const { container, getByText } = render(
      <WishBottle name="新手机" currentBalance={3000} targetPrice={5000} status="building" />
    );
    expect(container.querySelector('svg')).toBeTruthy();
    expect(getByText('新手机')).toBeTruthy();
  });

  it('shows progress percentage', () => {
    const { getAllByText } = render(
      <WishBottle name="新手机" currentBalance={3000} targetPrice={5000} status="building" />
    );
    const priceElements = getAllByText('¥3,000 / ¥5,000');
    expect(priceElements.length).toBeGreaterThan(0);
  });
});
