import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { WishBottle } from '../../components/wishes/WishBottle';

describe('WishBottle', () => {
  it('renders SVG bottle', () => {
    const { container } = render(
      <WishBottle name="新手机" currentBalance={3000} targetPrice={5000} status="building" />
    );
    expect(container.querySelector('svg')).toBeTruthy();
    expect(container.getByText('新手机')).toBeTruthy();
  });

  it('shows progress percentage', () => {
    const { getByText } = render(
      <WishBottle name="新手机" currentBalance={3000} targetPrice={5000} status="building" />
    );
    expect(getByText('3000 / 5000')).toBeTruthy();
  });
});
