import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { useBackKeys, keyboardIsBusy } from '@tapis/tapisui-common';

/**
 * A directory you cannot read renders an explanation instead of the listing —
 * and with the listing goes its keyboard model. These are the keys that have
 * to survive that, because a dead end is exactly where you want them.
 */
const Harness: React.FC<{ onBack: () => void; enabled?: boolean }> = ({
  onBack,
  enabled = true,
}) => {
  useBackKeys(onBack, enabled);
  return <input aria-label="somewhere to type" />;
};

describe('useBackKeys', () => {
  it('goes back on left, backspace and escape', () => {
    const onBack = jest.fn();
    renderComponent(<Harness onBack={onBack} />);

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    fireEvent.keyDown(window, { key: 'Backspace' });
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onBack).toHaveBeenCalledTimes(3);
  });

  it('ignores every other key', () => {
    const onBack = jest.fn();
    renderComponent(<Harness onBack={onBack} />);
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    fireEvent.keyDown(window, { key: 'a' });
    expect(onBack).not.toHaveBeenCalled();
  });

  it('leaves the keys to whoever is typing', () => {
    const onBack = jest.fn();
    renderComponent(<Harness onBack={onBack} />);
    screen.getByLabelText('somewhere to type').focus();

    // backspace in a text field means backspace
    fireEvent.keyDown(window, { key: 'Backspace' });
    expect(onBack).not.toHaveBeenCalled();
  });

  it('stands down when told to', () => {
    const onBack = jest.fn();
    renderComponent(<Harness onBack={onBack} enabled={false} />);
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(onBack).not.toHaveBeenCalled();
  });

  it('unbinds on unmount, so a closed page keeps no claim on the keys', () => {
    const onBack = jest.fn();
    const { unmount } = renderComponent(<Harness onBack={onBack} />);
    unmount();
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(onBack).not.toHaveBeenCalled();
  });
});

describe('keyboardIsBusy', () => {
  it('is the one place both handlers ask, so they cannot disagree', () => {
    renderComponent(<Harness onBack={jest.fn()} />);
    expect(keyboardIsBusy()).toBe(false);
    screen.getByLabelText('somewhere to type').focus();
    expect(keyboardIsBusy()).toBe(true);
  });
});
