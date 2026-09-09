/**
 * The keys that mean "back", wherever the file browser happens to be.
 *
 * The listing has a full keyboard model of its own, but the listing is not
 * always what is on screen: a directory you have no permission to read, or
 * one that is not there, renders an explanation instead — and that is exactly
 * the moment you most want ← or ⌫ to take you out of the dead end you just
 * walked into. Those pages get this.
 */
import { useEffect } from 'react';

/**
 * True when focus is in a form field, dialog, menu, or on a button or link,
 * so the listing leaves the key alone. Shared with the listing's own handler.
 */
export const keyboardIsBusy = (): boolean => {
  const focused = document.activeElement as HTMLElement | null;
  return Boolean(
    focused?.closest(
      'input, textarea, select, button, a, [contenteditable="true"], ' +
        '[role="dialog"], [role="menu"], [role="menuitem"], ' +
        '[role="listbox"], [role="option"]'
    )
  );
};

const BACK_KEYS = ['ArrowLeft', 'Backspace', 'Escape'];

export const useBackKeys = (onBack?: () => void, enabled = true) => {
  useEffect(() => {
    if (!enabled || !onBack) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (keyboardIsBusy() || !BACK_KEYS.includes(event.key)) return;
      // Backspace especially: some browsers still read it as 'go back a page'
      event.preventDefault();
      onBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onBack, enabled]);
};
