import { useContext } from 'react';
import { ToastContext } from './ToastContext';
import type { ToastContextValue } from '../../_components/toast/types';

/**
 * Convenience hook to access the toast context.
 * Must be called inside a `<ToastProvider>`.
 */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return ctx;
}
