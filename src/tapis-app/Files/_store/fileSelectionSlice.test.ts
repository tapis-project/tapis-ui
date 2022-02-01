import { configureStore } from '@reduxjs/toolkit';
import { default as fileSelectionReducer } from './fileSelectionSlice';
import { select, unselect, clear } from './fileSelectionSlice';
import '@testing-library/jest-dom/extend-expect';
import { ToastType } from 'tapis-app/_components/Toasts';
import { fileInfo } from 'fixtures/files.fixtures';

const file1 = { ...fileInfo, path: '/file1.txt' };
const file2 = { ...fileInfo, path: '/file2.txt' };
const file3 = { ...fileInfo, path: '/file3.txt' };

// Shim a redux store for this reducer
const store = configureStore({
  reducer: fileSelectionReducer,
});
const toast: ToastType = { message: 'test', icon: 'add', status: 'test' };

describe('fileSelectionSlice', () => {
  beforeEach(() => {
    store.dispatch(clear());
  });
  it('initializes the store', () => {
    expect(store.getState().selected).toEqual([]);
  });
  it('performs single file selection', () => {
    store.dispatch(select({ files: [ file1 ], mode: 'single' }));
    expect(store.getState().selected).toEqual([ file1 ]);
    store.dispatch(select({ files: [ file2 ], mode: 'single' }));
    expect(store.getState().selected).toEqual([ file2 ]);
  });
  it('performs multiselection', () => {
    store.dispatch(select({ files: [ file1 ], mode: 'single' }));
    expect(store.getState().selected).toEqual([ file1 ]);
    store.dispatch(select({ files: [ file2 ], mode: 'multi' }));
    expect(store.getState().selected).toEqual([ file1, file2 ]);
  });
  it('performs unselection', () => {
    store.dispatch(select({ files: [ file1, file2, file3 ], mode: 'multi' }));
    store.dispatch(unselect([ file2 ]));
    expect(store.getState().selected).toEqual([
      file1, file3
    ]);
  });
});
