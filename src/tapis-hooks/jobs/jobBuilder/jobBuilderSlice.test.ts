import { configureStore } from '@reduxjs/toolkit';
import { default as jobBuilderReducer, add, set, clear } from './jobBuilderSlice';
import '@testing-library/jest-dom/extend-expect';

jest.mock('uuid');

// Shim a redux store for this reducer
const store = configureStore({
  reducer: jobBuilderReducer,
});

describe('jobBuilderSlice', () => {
  beforeEach(() => {
    store.dispatch(clear());
  });
  it('initializes the store', () => {
    expect(store.getState().job).toEqual({});
  });
  it('sets the job to a value', () => {
    store.dispatch(set({ name: "testjob" }));
    expect(store.getState().job).toEqual({ name: "testjob" });
  });
  it('adds slices to a job', () => {
    store.dispatch(set({ name: "testjob" }));
    store.dispatch(add({ appId: "testapp" }));
    expect(store.getState().job).toEqual({ name: "testjob", appId: "testapp" });
    // Verify that it unsets an undefined value
    store.dispatch(add({ appId: undefined }));
    expect(store.getState().job).toEqual({ name: "testjob" });
  });

});
