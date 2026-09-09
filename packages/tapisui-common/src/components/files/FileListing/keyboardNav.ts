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
 * Someone is typing, or working a modal, and the keys are theirs.
 *
 * Shared with the listing's own handler so the two cannot come to different
 * conclusions about whether a keystroke was meant for them.
 */
export const keyboardIsBusy = (): boolean => {
  const focused = document.activeElement as HTMLElement | null;
  return Boolean(
    focused?.closest(
      'input, textarea, select, [contenteditable="true"], [role="dialog"]'
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
