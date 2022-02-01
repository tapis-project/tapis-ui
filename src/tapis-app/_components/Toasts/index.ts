export { default as toastsReducer } from './toastsSlice';
export { useToasts, useToastActions } from './hooks';

export type ToastType = {
  icon: string;
  status?: string;
  message: string;
};

export type ToastRecord = {
  id: string;
  read: boolean;
  toast: ToastType;
};
