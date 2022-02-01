import { configureStore } from '@reduxjs/toolkit';
import { toastsReducer } from 'tapis-app/_components/Toasts';

export const store = configureStore({
  reducer: {
    toasts: toastsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
