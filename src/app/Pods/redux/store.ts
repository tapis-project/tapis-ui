import { configureStore } from '@reduxjs/toolkit';
import podsReducer from './podsSlice';

const store = configureStore({
  reducer: {
    pods: podsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
