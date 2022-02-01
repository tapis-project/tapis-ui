import { configureStore } from '@reduxjs/toolkit';
import { toastsReducer } from 'tapis-app/_components/Toasts';
import { filesReducer } from 'tapis-app/Files/_store';

export const store = configureStore({
  reducer: {
    toasts: toastsReducer,
    files: filesReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
