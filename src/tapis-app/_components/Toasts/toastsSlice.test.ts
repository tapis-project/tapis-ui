import { configureStore } from '@reduxjs/toolkit';
import { default as toastsReducer } from './toastsSlice';
import { add, clear, set, markread, remove } from './toastsSlice';
import '@testing-library/jest-dom/extend-expect';
import { ToastType } from 'tapis-app/_components/Toasts';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid');

// Shim a redux store for this reducer
const store = configureStore({
  reducer: toastsReducer,
});
const toast: ToastType = { message: 'test', icon: 'add', status: 'test' };

describe('toastsSlice', () => {
  beforeEach(() => {
    store.dispatch(clear());
    (uuidv4 as jest.Mock).mockReturnValue('testuuid');
  });
  it('initializes the store', () => {
    expect(store.getState().toasts).toEqual([]);
  });
  it('adds and clears toasts', () => {
    store.dispatch(add(toast));
    expect(store.getState().toasts).toEqual([
      { id: 'testuuid', read: false, toast },
    ]);
    store.dispatch(clear());
    expect(store.getState().toasts).toEqual([]);
  });
  it('sets toasts', () => {
    const replacementToast = {
      message: 'replacement',
      icon: 'add',
      status: 'replacement',
    };
    store.dispatch(add(toast));
    store.dispatch(set({ id: 'testuuid', toast: replacementToast }));
    expect(store.getState().toasts).toEqual([
      { id: 'testuuid', read: false, toast: replacementToast },
    ]);
  });
  it('marks toasts as read', () => {
    store.dispatch(add(toast));
    store.dispatch(markread('testuuid'));
    expect(store.getState().toasts).toEqual([
      { id: 'testuuid', read: true, toast },
    ]);
  });
  it('removes toasts', () => {
    store.dispatch(add(toast));
    store.dispatch(remove('testuuid'));
    expect(store.getState().toasts).toEqual([]);
  });
});
