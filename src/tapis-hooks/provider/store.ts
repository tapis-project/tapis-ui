import { configureStore } from '@reduxjs/toolkit';
import jobs from '../jobs/store';

export const store = configureStore({
  reducer: {
    jobs,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
