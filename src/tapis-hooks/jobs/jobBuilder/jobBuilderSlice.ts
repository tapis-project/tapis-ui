import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Jobs } from '@tapis/tapis-typescript';

export interface JobState {
  job: Partial<Jobs.ReqSubmitJob>;
}

const initialState: JobState = {
  job: {},
};

export const jobBuilderSlice = createSlice({
  name: 'builder',
  initialState,
  reducers: {
    add: (state, action: PayloadAction<Partial<Jobs.ReqSubmitJob>>) => {
      // Create deep copy of original state, to prevent immer mutation problems
      const newJob = {
        ...JSON.parse(JSON.stringify(state.job)),
      };
      // Allow key/value pairs to be undefined
      for (const [key, value] of Object.entries(action.payload)) {
        if (value === undefined) {
          newJob[key] = undefined;
        } else {
          newJob[key] = JSON.parse(JSON.stringify(value));
        }
      }
      state.job = newJob;
    },
    set: (state, action: PayloadAction<Partial<Jobs.ReqSubmitJob>>) => {
      state.job = action.payload;
    },
    clear: (state) => {
      state.job = {};
    },
  },
});

export const { add, set, clear } = jobBuilderSlice.actions;

export default jobBuilderSlice.reducer;
