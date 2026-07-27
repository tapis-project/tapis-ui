import { createContext } from 'react';
import type { ToastContextValue } from '../../_components/toast/types';

export const ToastContext = createContext<ToastContextValue | undefined>(
  undefined
);
