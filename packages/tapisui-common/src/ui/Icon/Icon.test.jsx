import { expect, describe, it, beforeEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import Icon from './Icon';

const NAME = 'test-icon-name';
const CLASS = 'test-class-name';
const TEXT = 'test-icon-text';

describe('Icon', () => {
  beforeEach(cleanup);
  it('has correct `className (when not passed a `className`)`', () => {
    const { getByRole } = render(<Icon name={NAME} />);
    const icon = getByRole('img');
    expect(icon.className).toMatch(`icon-${NAME}`);
  });
  it('has correct `className` (when passed a `className`)', () => {
    const { getByRole } = render(<Icon name={NAME} className={CLASS} />);
    const icon = getByRole('img');
    expect(icon.className).toMatch(`icon-${NAME}`);
    expect(icon.className).toMatch(CLASS);
  });
  it('has correct `tagName`', () => {
    const { getByRole } = render(<Icon name={NAME} />);
    const icon = getByRole('img');
    expect(icon.tagName).toEqual('I');
  });
  it('has text', () => {
    const { getByLabelText } = render(<Icon name={NAME}>{TEXT}</Icon>);
    const label = getByLabelText(TEXT);
    expect(label).toBeDefined();
  });
});
