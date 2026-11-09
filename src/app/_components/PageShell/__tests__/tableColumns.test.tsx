import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ColumnsButton, makeColumnsStore } from '../tableColumns';

beforeEach(() => window.localStorage.clear());

describe('makeColumnsStore', () => {
  it('starts at the defaults, remembers a toggle, resets whole', () => {
    const store = makeColumnsStore('test.columns', ['a', 'b']);
    expect(store.get()).toEqual(['a', 'b']);
    expect(store.isDefault(store.get())).toBe(true);
    store.toggle('c');
    expect(store.get()).toEqual(['a', 'b', 'c']);
    expect(window.localStorage.getItem('test.columns')).toBe('["a","b","c"]');
    expect(store.isDefault(store.get())).toBe(false);
    store.toggle('a');
    expect(store.get()).toEqual(['b', 'c']);
    store.reset();
    expect(store.get()).toEqual(['a', 'b']);
    expect(window.localStorage.getItem('test.columns')).toBeNull();
  });
});

describe('ColumnsButton', () => {
  const options = [
    { id: 'a', label: 'Alpha' },
    { id: 'b', label: 'Beta', hint: 'the second letter' },
  ];

  it('opens to check rows and reports the toggle', () => {
    const onToggle = jest.fn();
    render(
      <ColumnsButton
        sections={[{ label: 'Columns', options }]}
        chosen={['a']}
        onToggle={onToggle}
        onReset={jest.fn()}
        isDefault={true}
      />
    );
    fireEvent.click(screen.getByLabelText('Choose columns'));
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('the second letter')).toBeInTheDocument();
    // checked state is spoken, not just painted
    expect(screen.getByText('Alpha').closest('button')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByText('Beta').closest('button')).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    fireEvent.click(screen.getByText('Beta'));
    expect(onToggle).toHaveBeenCalledWith('b');
    // at the defaults there is nothing to reset to
    expect(screen.queryByText(/Reset/)).toBeNull();
  });

  it('offers the way back only once the choice has left the defaults', () => {
    const onReset = jest.fn();
    render(
      <ColumnsButton
        sections={[{ label: 'Columns', options }]}
        chosen={['a', 'b']}
        onToggle={jest.fn()}
        onReset={onReset}
        isDefault={false}
      />
    );
    fireEvent.click(screen.getByLabelText('Choose columns'));
    fireEvent.click(screen.getByText('Reset to the defaults'));
    expect(onReset).toHaveBeenCalled();
  });
});
