/**
 * Which "New system" dialog opens — the rebuilt guided panel or the
 * classic stepper. A per-device choice, flipped in Settings › Preferences;
 * every door that creates a system reads it.
 */
import { useSyncExternalStore } from 'react';

export type NewSystemDialogMode = 'guided' | 'classic';

const KEY = 'systems.newSystemDialog';

const read = (): NewSystemDialogMode => {
  try {
    return window.localStorage.getItem(KEY) === 'classic'
      ? 'classic'
      : 'guided';
  } catch {
    return 'guided';
  }
};

let mode: NewSystemDialogMode = read();

const listeners = new Set<() => void>();

export const subscribeNewSystemDialogMode = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getNewSystemDialogMode = (): NewSystemDialogMode => mode;

export const setNewSystemDialogMode = (next: NewSystemDialogMode) => {
  mode = next;
  try {
    window.localStorage.setItem(KEY, next);
  } catch {
    // it still holds for this visit
  }
  listeners.forEach((listener) => listener());
};

export const useNewSystemDialogMode = (): NewSystemDialogMode =>
  useSyncExternalStore(subscribeNewSystemDialogMode, getNewSystemDialogMode);

export const resetNewSystemDialogMode = () => {
  mode = 'guided';
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // fine
  }
  listeners.forEach((listener) => listener());
};
