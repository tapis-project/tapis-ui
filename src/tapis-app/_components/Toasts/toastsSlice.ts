import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ToastRecord, ToastType } from '.';
import { v4 as uuidv4 } from 'uuid';

export interface ToastsState {
  toasts: Array<ToastRecord>;
}

const initialState: ToastsState = {
  toasts: [],
};

export const toastsSlice = createSlice({
  name: 'toasts',
  initialState,
  reducers: {
    add: (state, action: PayloadAction<ToastType>) => {
      const toast = action.payload;
      state.toasts = [{ toast, id: uuidv4(), read: false }, ...state.toasts];
    },
    markread: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const index = state.toasts.findIndex((existing) => existing.id === id);
      if (index === -1) {
        throw new Error(`Could not find notification with id ${id}`);
      }
      state.toasts[index].read = true;
    },
    remove: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const index = state.toasts.findIndex((existing) => existing.id === id);
      if (index === -1) {
        throw new Error(`Could not find notification with id ${id}`);
      }
      state.toasts.splice(index, 1);
    },
    set: (state, action: PayloadAction<{ id: string; toast: ToastType }>) => {
      const { id, toast } = action.payload;
      const index = state.toasts.findIndex((existing) => existing.id === id);
      if (index === -1) {
        throw new Error(`Could not find notification with id ${id}`);
      }
      state.toasts[index].toast = { ...toast };
    },
  },
});

export const { add, markread, remove, set } = toastsSlice.actions;

export default toastsSlice.reducer;
